import { NextResponse } from "next/server";
import OpenAI from "openai";
import { DataAPIClient } from "@datastax/astra-db-ts";
import Groq from "groq-sdk";

export async function POST(req: Request) {
	const { messages } = await req.json();
	const userMessage = messages[messages.length - 1].content;

	const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });

	const openai = new OpenAI({
		apiKey: process.env.OPENAI_API_KEY!,
	});

	const embedding = await openai.embeddings.create({
		model: "text-embedding-3-small",
		input: userMessage,
		encoding_format: "float",
	});

	const queryEmbedding = embedding.data[0].embedding;

	// Conn to AstraDB
	const client = new DataAPIClient(process.env.ASTRA_DB_APPLICATION_TOKEN!);
	const db = client.db(process.env.ASTRA_DB_API_ENDPOINT!, {
		namespace: process.env.ASTRA_DB_NAMESPACE!,
	});

	try {
		const collection = await db.collection(process.env.ASTRA_DB_COLLECTION!);

		// Vector Search
		const results = await collection.find(
			{},
			{
				sort: { $vector: queryEmbedding },
				limit: 5,
				includeSimilarity: true,
			}
		);

		// gabungin semua konten hasil pencarian
		// note: collection.find() itu hasilnya FindCursor<FoundDoc<SomeDoc>, FoundDoc<SomeDoc>>, jadi perlu di .toArray()

		let docs = [];
		try {
			docs = await results.toArray();
		} catch (error) {
			console.error("Error converting results to array: ", error);

			// fallback
			if (results && typeof results[Symbol.asyncIterator] === "function") {
				for await (const doc of results) {
					docs.push(doc);
				}
			}
		}

		const context = docs.map((doc) => doc.text || "").join("\n\n");

		// SYSTEM PROMPTING RAG
		const systemPrompt = `
        Kamu adalah Roga, asisten AI ITB bermaskot gajah.
        Gaya bicara: ramah, jelas, sopan, sedikit lucu. Gunakan Markdown bila perlu.

        **ATURAN PRIORITAS:**
        1. HANYA jawab pertanyaan yang RELEVAN dengan ITB (akademik, kampus, mahasiswa, budaya, lokasi, dll).

        2. Untuk pertanyaan ITB:
        - **Ada di konteks** → gunakan konteks sebagai sumber utama. Boleh tambah penjelasan umum, TAPI jangan ngarang data faktual (angka, nama resmi, aturan).
        - **Sebagian di konteks** → gunakan konteks + pengetahuan umum ITB yang AMAN (misal: lokasi gedung umum, tips belajar, pengalaman mahasiswa). Jangan buat daftar resmi yang ga ada di konteks.
        - **Tidak ada di konteks** → kalau masih terkait ITB atau pertanyaan mengandung "itb", try to answer dengan pengetahuan umum with your best try.
        3. Jika pertanyaan TIDAK terkait ITB → tolak dengan sopan: "Maaf, aku kurang tahu tentang hal itu!"

        **LARANGAN:**
        - Jangan sebut "konteks", "RAG", "dokumen", "database".
        - Jangan ngarang: fakultas, jurusan, singkatan resmi, nama pejabat, aturan akademik, angka statistik.
        - Jangan keluar dari topik ITB.
        `.trim();

		const userPrompt = `
        Konteks:
        ${context}

        Pertanyaan: ${userMessage}
        `.trim();

		// STREAMING RESPONSE (useChat())

		// Groq
		// (alt: llama-3.3-70b-versatile)
		// (alt: llama-3.1-8b-instant) aga ngawur ini
		// const completion = await groq.chat.completions.create({
		// 	model: "llama-3.3-70b-versatile",
		// 	stream: true,
		// 	messages: [{ role: "system", content: systemPrompt }, ...messages],
		// 	max_tokens: 2048,
		// 	temperature: 1.0,
		// });

		// NOTES FOR SELF:
		// temp itu kalo tinggi bakal ngarang, kalo rendah bakal konservatif
		// top_p itu seberapa besar range pilihan kata (0.1 -> hanya kata yg umum aja)

		console.log("=== TOP 5 RETRIEVED DOCS ===");
		docs.slice(0, 5).forEach((doc, i) => {
			console.log(`[${i}] Score: ${doc.$similarity || "N/A"}`);
			console.log(`Text: ${doc.text?.substring(0, 200)}...\n`);
		});
		console.log("=== FULL CONTEXT LENGTH ===", context.length);

		// OpenAI
		const completion = await openai.chat.completions.create({
			model: "gpt-4o-mini",
			stream: true,
			messages: [
				{ role: "system", content: systemPrompt },
				{ role: "user", content: userPrompt },
			],
		});

		const encoder = new TextEncoder();
		const stream = new ReadableStream({
			async start(controller) {
				try {
					for await (const chunk of completion) {
						const content = chunk.choices[0]?.delta?.content || "";
						if (content) {
							controller.enqueue(encoder.encode(content));
						}
					}
					controller.close();
				} catch (error) {
					console.error(error);
					controller.error(error as Error);
				}
			},
		});

		return new Response(stream, {
			headers: {
				"Content-Type": "text/plain; charset=utf-8",
				"Transfer-Encoding": "chunked",
			},
		});
	} catch (error) {
		console.error(error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 }
		);
	}
}
