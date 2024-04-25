# CityChats
Bridging the gap between citizens and their local government by leveraging public record data.

## Prerequisites

- An Astra DB account. You can [create one here](https://astra.datastax.com/register)
- An OpenAI account and api key [create one here](https://platform.openai.com/)

## Setup

Clone this repository to your local machine.

Install the rest of the dependencies by running `npm install`.

[1Create a Vector Database](https://docs.datastax.com/en/astra/astra-db-vector/get-started/quickstart.html#create-a-serverless-vector-database) in Astra and generate and Application Token.

Copy to supplied `.env.example` to `.env` and enter your credentials for OpenAI and AstraDB:

- `OPENAI_API_KEY`: API key for OPENAI
- `ASTRA_DB_API_ENDPOINT`: Your Astra DB vector database endpoint
- `ASTRA_DB_APPLICATION_TOKEN`: The generated app token for your Astra database


## Load the data

The first thing you need to to run this chatbot is to load the data. Start by creating an example_data folder in the /src that includes your pdf files. Then run:

`npx ts-node scripts/loadPdf.ts`

## Running the Project

Once the data is loaded, run `npm run dev` in your terminal. Open [http://localhost:3000](http://localhost:3000) to view the chatbot in your browser.
