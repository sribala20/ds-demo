import { AstraDB } from "@datastax/astra-db-ts";
import { PuppeteerWebBaseLoader } from "langchain/document_loaders/web/puppeteer";
import OpenAI from "openai";


import {RecursiveCharacterTextSplitter} from "langchain/text_splitter";
import 'dotenv/config'

type SimilarityMetric = "dot_product" | "cosine" | "euclidean";

const {ASTRA_DB_COLLECTION, ASTRA_DB_APPLICATION_TOKEN, ASTRA_DB_API_ENDPOINT, OPENAI_API_KEY} = process.env;

const openai = new OpenAI();

const eventData = [
  ''];

const astraDb = new AstraDB(ASTRA_DB_APPLICATION_TOKEN, ASTRA_DB_API_ENDPOINT);

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 512,
  chunkOverlap: 100,
});

const createCollection = async (similarityMetric: SimilarityMetric = 'dot_product') => {
  const res = await astraDb.createCollection(ASTRA_DB_COLLECTION, {
    vector: {
      dimension: 1536,
      metric: similarityMetric,
    }
  });
  console.log(res);
};

const loadSampleData = async (similarityMetric: SimilarityMetric = 'dot_product') => {
  const collection = await astraDb.collection(ASTRA_DB_COLLECTION);
  for await (const url of eventData) {
    console.log(`Processing url ${url}`);
    const content = await scrapePage(url);
    console.log(content)
    const chunks = await splitter.splitText(content);
    for await (const chunk of chunks) {
      const embedding = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: chunk,
        encoding_format: "float",
      });

      const vector = embedding.data[0].embedding;

      const res = await collection.insertOne({
        $vector: vector,
        text: chunk
      });
      console.log(res)
    }
  }
};

const scrapePage = async (url: string) => {
  const loader = new PuppeteerWebBaseLoader(url, {
    launchOptions: {
      headless: true
    },
    gotoOptions: {
      waitUntil: "domcontentloaded",
    },
    evaluate: async (page, browser) => {
      const result = await page.evaluate(() => document.body.innerHTML);
      await browser.close();
      return result;
    },
  });
  return (await loader.scrape())?.replace(/<[^>]*>?/gm, '');
};

createCollection().then(() => loadSampleData());
//loadSampleData();