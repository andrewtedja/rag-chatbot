import { DataAPIClient } from "@datastax/astra-db-ts";
import { PuppeteerWebBaseLoader } from "@langchain/community/document_loaders/web/puppeteer";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import OpenAI from "openai";

import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import "dotenv/config";

type SimilarityMetric = "cosine" | "euclidean" | "dot_product";

const {
	ASTRA_DB_NAMESPACE,
	ASTRA_DB_COLLECTION,
	ASTRA_DB_API_ENDPOINT,
	ASTRA_DB_APPLICATION_TOKEN,
	OPENAI_API_KEY,
} = process.env;

const openai = new OpenAI({
	apiKey: OPENAI_API_KEY,
});

const itbData = [
	"https://en.wikipedia.org/wiki/Bandung_Institute_of_Technology",
	"https://six.itb.ac.id/pub/kur2024",
	"https://akademik.itb.ac.id/id/program/S1/S",
	"https://akademik.itb.ac.id/id/program/S1/M",
	"https://akademik.itb.ac.id/id/program/S1/W",
	"https://akademik.itb.ac.id/id/program/S1/X",
	"https://itb.ac.id/",
	"https://itb.ac.id/partners",
	"https://itb.ac.id/visitor",
	"https://itb.ac.id/multicampus",
	"https://itb.ac.id/research-centers",
	"https://itb.ac.id/undergraduate",
	"https://admission.itb.ac.id/info/",
	"https://admission.itb.ac.id/info/program-studi/",
	"https://admission.itb.ac.id/info/event-berita/",
	"https://admission.itb.ac.id/info/kontak/",
	"https://itb.ac.id/contact",
];

const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN);
const db = client.db(ASTRA_DB_API_ENDPOINT, { namespace: ASTRA_DB_NAMESPACE });

const splitter = new RecursiveCharacterTextSplitter({
	chunkSize: 512,
	chunkOverlap: 100,
});

const createCollection = async (
	similarityMetric: SimilarityMetric = "cosine"
) => {
	const res = await db.createCollection(ASTRA_DB_COLLECTION, {
		vector: {
			dimension: 1536,
			metric: similarityMetric,
		},
	});
	console.log(res);
};
