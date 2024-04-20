import OpenAI from 'openai';
import { OpenAIStream, StreamingTextResponse } from "ai";
import { AstraDB } from "@datastax/astra-db-ts";

const {
  ASTRA_DB_API_ENDPOINT,
  ASTRA_DB_APPLICATION_TOKEN,
  ASTRA_DB_COLLECTION,
  OPENAI_API_KEY,
} = process.env;

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

const astraDb = new AstraDB(ASTRA_DB_APPLICATION_TOKEN, ASTRA_DB_API_ENDPOINT);

export async function POST(req: Request) {
  try {
    const {messages} = await req.json();
    const latestMessage = messages[messages?.length - 1]?.content;

    let docContext = '';

    const embedding = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: latestMessage,
      encoding_format: "float",
    });

    try {
      const collection = await astraDb.collection(ASTRA_DB_COLLECTION);
      const cursor = collection.find(null, {
        sort: {
          $vector: embedding.data[0].embedding,
        },
        limit: 10,
      });

      const documents = await cursor.toArray();

      const docsMap = documents?.map(doc => doc.text);

      docContext = JSON.stringify(docsMap);
    } catch (e) {
      console.log("Error querying db...");
      docContext = "";
    }
//Only if the context does not provide any information relevant to the question, state that more information can be found on the Slo City website https://www.slocity.org/
//state documents where more information can be found. 
    const Template = {
      role: 'system',
      content: `You are a kind and happy AI assistant providing citizens of San Luis Obispo answers to their questions about San Luis Obispo city government.
      The context will provide you with the page data from San Luis Obispo city council agenda packets, city ordinances, and meeting minutes.
      Answer in a conscise, 3-5 sentence response.
      If the context doesn't include the information you need to answer based on your existing knowledge and don't mention the source of your information or what the context does or doesn't include. 
      Format responses using markdown where applicable and don't return images. 
        ----------------
        START CONTEXT
        ${docContext}
        END CONTEXT
        ----------------
        QUESTION: ${latestMessage}
        ----------------      
        `
    };

    const response = await openai.chat.completions.create(
      {
        model: 'gpt-4',
        stream: true,
        messages: [Template, ...messages],
      }
    );
    const stream = OpenAIStream(response);

    return new StreamingTextResponse(stream);
  } catch (e) {
    throw e;
  }
}
