import { DataAPIClient } from "@datastax/astra-db-ts";
import { PuppeteerWebBaseLoader } from "@langchain/community/document_loaders/web/puppeteer";
// import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import OpenAI from "openai";
import * as cheerio from "cheerio";

import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import "dotenv/config";

/**
 * Links:
 * https://platform.openai.com/docs/guides/embeddings
 * https://docs.datastax.com/en/astra-db-serverless/administration/manage-application-tokens.html
 * https://docs.langchain.com/
 */

type SimilarityMetric = "dot_product" | "cosine" | "euclidean";

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
	"https://itb.ac.id/undergraduate",
	"https://itb.ac.id/contact",
	"https://itb.ac.id/sejarah",
	"https://itb.ac.id/visi-dan-misi",
	"https://itb.ac.id/tugas-dan-fungsi",
	"https://itb.ac.id/in-harmonia-progressio",
	"https://itb.ac.id/rektor",
	"https://itb.ac.id/multikampus",
	"https://itb.ac.id/tentang-itb",
];

const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN);
const db = client.db(ASTRA_DB_API_ENDPOINT, { namespace: ASTRA_DB_NAMESPACE });

const splitter = new RecursiveCharacterTextSplitter({
	chunkSize: 512,
	chunkOverlap: 100,
});

const createCollection = async (
	similarityMetric: SimilarityMetric = "dot_product"
) => {
	const res = await db.createCollection(ASTRA_DB_COLLECTION, {
		vector: {
			dimension: 1536,
			metric: similarityMetric,
		},
	});
	console.log(res);
};

const loadSampleData = async () => {
	const collection = await db.collection(ASTRA_DB_COLLECTION);
	for await (const url of itbData) {
		const content = await scrapePage(url);
		const chunks = await splitter.splitText(content);
		for await (const chunk of chunks) {
			const embedding = await openai.embeddings.create({
				model: "text-embedding-3-small",
				input: chunk,
				encoding_format: "float",
			});
			// ini array of nums
			const vector = embedding.data[0].embedding;
			const res = await collection.insertOne({
				$vector: vector,
				text: chunk,
			});
			console.log(res);
		}
	}
};

const scrapePage = async (url: string) => {
	const loader = new PuppeteerWebBaseLoader(url, {
		launchOptions: {
			headless: true,
		},
		gotoOptions: {
			waitUntil: "networkidle0",
		},
	});

	const html = await loader.scrape();
	if (!html) return "";

	// Parse & clean pake Cheerio
	const $ = cheerio.load(html);
	$("script, style, nav, footer, header").remove();
	$('[class*="menu"], [id*="menu"]').remove();
	$('[class*="footer"], [id*="footer"]').remove();
	$('[class*="header"], [id*="header"]').remove();
	const text = $("body").text();

	return text
		.replace(/\s+/g, " ") // normalize whitespace
		.trim();
};

createCollection().then(() => loadSampleData());
