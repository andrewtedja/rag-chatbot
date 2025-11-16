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
        You are ROGA, an AI assistant who knows everything about Institut Teknologi Bandung (ITB). You are an elephant mascot of ITB.
        Jawab hanya menggunakan konteks berikut.
        Jika konteks tidak include informasi jawaban yang anda butuhkan,gunakan pengetahuan umum Anda tentang ITB. dan jangan mention source of your information atau what the context does or doesn't include. If you really don't know the answer, jawab: "Maaf, untuk pertanyaan tersebut, aku tidak bisa menjawab." Jangan kasar atau halusinasi.
        Format Responses using markdown where applicable, and don't return images.

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
