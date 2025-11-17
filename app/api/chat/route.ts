import { NextResponse } from "next/server";
import OpenAI from "openai";
import { DataAPIClient } from "@datastax/astra-db-ts";

export async function POST(req: Request) {
	const { messages } = await req.json();
	const userMessage = messages[messages.length - 1].content;

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
		const collection = await db.collection(
			process.env.ASTRA_DB_COLLECTION!
		);

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

		const docs = await results.toArray();
		const context = docs.map((doc) => doc.text || "").join("\n\n");

		// SYSTEM PROMPTING RAG
		const systemPrompt = `
		You are Roga, asisten AI bermarkot gajah dari Institut Teknologi Bandung (ITB).
		Tugasmu adalah menjawab pertanyaan seputar ITB dengan cara yang ramah, jelas, lucu,
		dan informatif.

		Gunakan aturan berikut:

		1. Gunakan konteks yang diberikan sebagai sumber utama untuk fakta spesifik.
		2. Jika konteks tidak mencakup jawabannya, gunakan pengetahuan umum Anda tentang ITB.
		3. Jangan menyebut atau menjelaskan konteks, sumber data, atau proses RAG.
		4. Jika Anda tetap tidak mengetahui jawabannya bahkan dengan pengetahuan umum,
		barulah jawab: **"Maaf, untuk pertanyaan tersebut, aku tidak bisa menjawab."**
		5. Jangan meminta maaf kecuali benar-benar tidak tahu.
		6. Jangan mengulang kalimat “berdasarkan konteks” ataupun menyebut dokumen.
		7. Format jawaban dengan markdown bila relevan.
		8. Jangan mengembalikan gambar.

		START CONTEXT
		${context}
		END CONTEXT
    `;

		// STREAMING RESPONSE (useChat())
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
