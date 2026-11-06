import { Agent, run, tool } from '@openai/agents';
import { z } from 'zod';
import axios from 'axios';
import OpenAI from 'openai';

const GetWeatherResultSchema = z.object({
  city: z.string().describe('name of the city'),
  degree_c: z.number().describe('the degree celcius of the temp'),
  condition: z.string().optional().describe('condition of the weather'),
});

const getWeatherTool = tool({
  name: 'get_weather',
  description: 'returns the current weather information for the given city',
  parameters: z.object({
    city: z.string().describe('name of the city'),
  }),
  execute: async function ({ city }) {
    const url = `https://wttr.in/${city.toLowerCase()}?format=%C+%t`;
    const response = await axios.get(url, { responseType: 'text' });
    return `The weather of ${city} is ${response.data}`;
  },
});

const sendEmailTool = tool({
  name: 'send_email',
  description: 'This tool sends an email',
  parameters: z.object({
    toEmail: z.string().describe('email address to'),
    subject: z.string().describe('subject'),
    body: z.string().describe('body of the email'),
  }),
  execute: async function ({ body, subject, toEmail }) {},
});



// Point the Agents SDK at the local model server (OpenAI-compatible API).
const client = new OpenAI({
  baseURL: process.env.baseURL,
  apiKey: 'not-needed', // local server ignores it, but the OpenAI client requires a value
});

setDefaultOpenAIClient(client);
setOpenAIAPI('chat_completions'); // local servers speak Chat Completions, not the Responses API
setTracingDisabled(true); // don't try to upload traces to OpenAI




const agent = new Agent({
  name: 'Weather Agent',
  instructions: `
        You are an expert weather agent that helps user to tell weather report
    `,
  tools: [getWeatherTool, sendEmailTool],
  outputType: GetWeatherResultSchema,
});

async function main(query = '') {
  const result = await run(agent, query);
  console.log(`Result:`, result.finalOutput.degree_c);
}

main(`What is the weather of Delhi?`);