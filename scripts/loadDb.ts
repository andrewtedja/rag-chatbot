import { DataAPIClient } from "@datastax/astra-db-ts";
import { PuppeteerWebBaseLoader } from "@langchain/community/document_loaders/web/puppeteer";
// import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import OpenAI from "openai";

import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

import "dotenv/config";
