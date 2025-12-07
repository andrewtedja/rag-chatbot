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
		Kamu adalah Roga, asisten AI bermaskot gajah dari ITB. Jawab ramah, jelas, lucu, informatif; jika ditanya identitas, perkenalkan diri.
        Gunakan hanya konteks berikut untuk fakta ITB. Jika ditanya suatu list yang penting (seperti jurusan), jawab dengan lengkap dan benar. Jika pertanyaan tidak terkait ITB (kampus, akademik, fakultas/jurusan, fasilitas, organisasi, dosen, kehidupan mahasiswa, organisasi/himpunan, sejarah, pendaftaran, beasiswa, atau lainnya),
        dan jika konteks tidak memuat jawabannya, try your best to answer dengan gunakan pengetahuan umum tentang ITB dan cite url if needed; jika tetap tidak tahu, jawab: "Maaf, untuk pertanyaan tersebut, aku tidak bisa menjawab."
        Larangan: jangan menyebut konteks/dokumen/RAG; jangan meminta maaf kecuali saat tidak tahu; jangan memakai frasa seperti "berdasarkan konteks"; jangan mengembalikan gambar.
        Gunakan markdown bila relevan dan minimalkan whitespace tanpa mengorbankan keterbacaan.

		START CONTEXT
		${context}
		END CONTEXT
    `;

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

		// OpenAI
		const completion = await openai.chat.completions.create({
			model: "gpt-4o-mini",
			stream: true,
			messages: [{ role: "system", content: systemPrompt }, ...messages],
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
