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

    const Template = {
      role: 'system',
      content: `You are an AI assistant that will help citizens understand what is happening in their government. Provide a title for the context and where the source is from. provide dates if possible.
      Determine how relevant it is to the question.   
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
