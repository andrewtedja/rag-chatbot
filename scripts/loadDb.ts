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
	"https://itb.ac.id/program-studi-sarjana",
	"https://stei.itb.ac.id/sekilas/",
	"https://itb.ac.id/fakultas-dan-sekolah",
	"https://stei.itb.ac.id/program-sarjana/sarjana-teknik-elektro/",
	"https://stei.itb.ac.id/program-sarjana/sarjana-informatika/",
	"https://stei.itb.ac.id/program-sarjana/sarjana-sistem-teknologi-informasi/",
	"https://stei.itb.ac.id/program-sarjana/sarjana-telekomunikasi/",
	"https://stei.itb.ac.id/program-sarjana/sarjana-biomedis/",
	"https://stei.itb.ac.id/program-sarjana/sarjana-tenaga-listrik/",
	"https://stei.itb.ac.id/akreditasi/",
	"https://en.wikipedia.org/wiki/Bandung_Institute_of_Technology",
	"https://six.itb.ac.id/pub/kur2024",
	"https://akademik.itb.ac.id/id/program/S1/S",
	"https://akademik.itb.ac.id/id/program/S1/M",
	"https://akademik.itb.ac.id/id/program/S1/W",
	"https://akademik.itb.ac.id/id/program/S1/X",
	"https://itb.ac.id/undergraduate",
	"https://itb.ac.id/contact",
	"https://itb.ac.id/sejarah",
	"https://itb.ac.id/visi-dan-misi",
	"https://itb.ac.id/rektor",
	"https://itb.ac.id/multikampus",
	"https://itb.ac.id/tentang-itb",
];

const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN);
const db = client.db(ASTRA_DB_API_ENDPOINT, { namespace: ASTRA_DB_NAMESPACE });

const splitter = new RecursiveCharacterTextSplitter({
	chunkSize: 1000,
	chunkOverlap: 200,
});

const shouldClear = process.argv.includes("--clear");

// run pake npm run seed -- --clear
const createCollection = async (
	similarityMetric: SimilarityMetric = "cosine"
) => {
	const collection = await db.collection(ASTRA_DB_COLLECTION);

	if (shouldClear) {
		try {
			await collection.drop();
			console.log("Collection dropped (--clear flag)");
		} catch (e) {
			console.log("No collection to drop", e);
		}
	}

	// Create
	try {
		const res = await db.createCollection(ASTRA_DB_COLLECTION, {
			vector: {
				dimension: 1536,
				metric: similarityMetric,
			},
		});
		console.log("Collection created:", res);
	} catch (error) {
		if (
			error instanceof Error &&
			error.name === "CollectionAlreadyExistsError"
		) {
			console.log(
				`Collection '${ASTRA_DB_COLLECTION}' already exists, skipping creation...`
			);
		} else {
			throw error;
		}
	}
};

const loadSampleData = async () => {
	const collection = await db.collection(ASTRA_DB_COLLECTION);
	let totalChunks = 0;

	for (const [index, url] of itbData.entries()) {
		try {
			console.log(`\n[${index + 1}/${itbData.length}] -> ${url}`);

			const content = await scrapePage(url);
			// if (!content || content.length < 20) {
			// 	console.warn(`[WARNING] Skipped`);
			// 	continue;
			// }

			const chunks = await splitter.splitText(content);
			console.log(`  → ${chunks.length} chunks`);

			// BATCH EMBEDDING (all chunks at once)
			const embeddings = await openai.embeddings.create({
				model: "text-embedding-3-small",
				input: chunks,
				encoding_format: "float",
			});

			// INSERT BATCH
			const docs = chunks.map((chunk, i) => ({
				$vector: embeddings.data[i].embedding,
				text: chunk,
				source: url,
			}));

			// Batch insert
			await collection.insertMany(docs);
			totalChunks += chunks.length;

			console.log(`Inserted`);
		} catch (error) {
			console.error(`Error:`, error.message);
		}
	}

	console.log(`\nTotal: ${totalChunks} chunks`);
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
	$("script, style, noscript").remove();

	let text = "";

	const mainContent = $(
		"main, article, [role='main'], .main-content, #main-content, .content, #content"
	);

	if (mainContent.length > 0) {
		text = mainContent.text();
		console.log(`Found main content via selector`);
	} else {
		// Fallback ke body
		text = $("body").text();
		console.log(`Using body (no main content selector found)`);
	}

	const cleaned = text.replace(/\s+/g, " ").trim();

	console.log(
		`${cleaned.length} chars | Preview: ${cleaned.substring(0, 300)}...`
	);

	return cleaned;
};

createCollection().then(() => loadSampleData());
