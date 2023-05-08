import express from 'express';
import bodyParser from 'body-parser';
import { Configuration, OpenAIApi } from 'openai';
import cors from 'cors';
import dotenv from 'dotenv';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { OpenAI } from 'langchain/llms/openai';
import { HNSWLib } from 'langchain/vectorstores/hnswlib';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { loadQAStuffChain, loadQAMapReduceChain } from "langchain/chains";

dotenv.config()

// Initialize OpenAI API client
const openaiConfig = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(openaiConfig);

const app = express()
app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.json())
const port = process.env.PORT || 8008;

app.get('/', async (req, res) => {
    res.status(200).send({
        message: 'Hello Welcome to MCU Assistant'
    })
})

const generateText = async (queryText) => {
    try {
        const dataFilePath = './data.txt';
        if (!dataFilePath) {
            throw new Error('Fine-tune data not provided');
        }

        console.log('------------------Loading test data------------------')

        const loader = new TextLoader(dataFilePath);
        const docs = await loader.load();

        console.log('------------------Test Data Loaded------------------')
        // console.log(docs);
        console.log("------------------Splitting documents------------------");

        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 2500,
            chunkOverlap: 1000,
        });

        const output = await splitter.splitDocuments(docs);

        console.log("------------------Documents splitted------------------");

        // console.log(output);

        console.log("------------------Vector store------------------");

        // const vectorStore = await HNSWLib.fromDocuments(output, new OpenAIEmbeddings());

        console.log("------------------Vector store created------------------");

        // console.log(vectorStore);
        // await vectorStore.save('data');

        const loadedVectorStore = await HNSWLib.load(
            'data',
            new OpenAIEmbeddings()
        );

        console.log("------------------Similarity search------------------");

        const result = await loadedVectorStore.similaritySearch(queryText, 4);

        // console.log(result);

        console.log("------------------Loading LLM------------------");
        const llmA = new OpenAI({});
        console.log("------------------Loading QA chain------------------");
        const chainA = loadQAStuffChain(llmA);
        const res = await chainA.call({
            input_documents: result,
            question: queryText,
        });
        console.log("------------------QA chain result------------------");
        console.log('question: ', queryText);
        console.log('answer: ', res.text);

        return res.text
    } catch (error) {
        console.error(`Error: ${error}`);
        return error
    }
};
// console.log(generateText("complete movie details of avengers endgame"));

app.post('/', async (req, res) => {
    const { message } = req.body;
    const response = await generateText(message);
    res.status(200).send(response);
})


app.listen(port, () => console.log('AI server started on http://localhost:8008'));