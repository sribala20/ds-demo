import { AstraDB } from "@datastax/astra-db-ts";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
//import { PuppeteerWebBaseLoader } from "langchain/document_loaders/web/puppeteer";
import OpenAI from "openai";
import {RecursiveCharacterTextSplitter} from "langchain/text_splitter";
import 'dotenv/config'

type SimilarityMetric = "dot_product" | "cosine" | "euclidean";

const {ASTRA_DB_COLLECTION, ASTRA_DB_APPLICATION_TOKEN, ASTRA_DB_API_ENDPOINT, OPENAI_API_KEY} = process.env;

const openai = new OpenAI();

// const eventData = [
//   ''];

const astraDb = new AstraDB(ASTRA_DB_APPLICATION_TOKEN, ASTRA_DB_API_ENDPOINT);


const createCollection = async (similarityMetric: SimilarityMetric = 'dot_product') => {
  const res = await astraDb.createCollection(ASTRA_DB_COLLECTION, {
    vector: {
      dimension: 1536,
      metric: similarityMetric,
    }
  });
  console.log(res);
};

/* Load all PDFs within the specified directory */
const directoryLoader = new DirectoryLoader(
    "/Users/srirocks2020/ds-demo/scripts/src/example_data",
    {
      ".pdf": (path: string) => new PDFLoader(path),
    }
  );
  
  
  /* Additional steps : Split text into chunks with any TextSplitter. You can then use it as context or save it to memory afterwards. */
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });
  

const loadSampleData = async (similarityMetric: SimilarityMetric = 'dot_product') => {
    const docs = await directoryLoader.load();
    console.log({ docs });
    const collection = await astraDb.collection(ASTRA_DB_COLLECTION);
    const splitDocs = await textSplitter.splitDocuments(docs);
    const texts: string[] = splitDocs.map(document => document.pageContent);
    console.log({ texts });
    for await (const chunk of texts) {
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
  };

// const scrapePage = async (url: string) => {
//   const loader = new PuppeteerWebBaseLoader(url, {
//     launchOptions: {
//       headless: true
//     },
//     gotoOptions: {
//       waitUntil: "domcontentloaded",
//     },
//     evaluate: async (page, browser) => {
//       const result = await page.evaluate(() => document.body.innerHTML);
//       await browser.close();
//       return result;
//     },
//   });
//   return (await loader.scrape())?.replace(/<[^>]*>?/gm, '');
// };

//createCollection().then(() => loadSampleData());
loadSampleData();