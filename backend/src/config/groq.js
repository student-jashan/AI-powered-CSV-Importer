import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import Groq from "groq-sdk";
import dotenv from "dotenv";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../../.env') });

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

export default groq;
