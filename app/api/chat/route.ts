import { NextResponse } from "next/server";
import OpenAI from "openai";
import { DataAPIClient } from "@datastax/astra-db-ts";

type ItbDoc = {
	$vector: number[];
	text: string;
};

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

	const docs = await results.toArray();
	const context = docs.map((doc) => doc.text || "").join("\n\n");

	// SYSTEM PROMPTING RAG
	const systemPrompt = `
        You are ROGA, Elephant Mascot and Chatbot of Bandung Institute of Technology (ITB).
        Jawab hanya menggunakan konteks berikut.
        Jika tidak ada di konteks, jawab: "Maaf, untuk pertanyaan tersebut, aku tidak bisa menjawab."

        Context:
        ${context}
    `;

	// STREAMING RESPONSE (useChat())
	const completion = await openai.chat.completions.create({
		model: "gpt-4o-mini",
		stream: true,
		messages: [{ role: "system", content: systemPrompt }, ...messages],
	});

	//non stream
	// return NextResponse.json(completion.choices[0].message);

	// stream
	return new NextResponse(completion.toReadableStream());
}
