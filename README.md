# open-ai-agent-sdk-tool

A small example of using the [OpenAI Agents SDK](https://github.com/openai/openai-agents-js) (`@openai/agents`) with **custom tools** and **structured output**, running against a **local OpenAI-compatible model server** (e.g. Ollama, LM Studio, llama.cpp, vLLM).

The script defines a "Weather Agent" that answers weather questions by calling a live weather tool and returns its answer as a typed object validated with Zod.

## How it works

`agent-tool.js` does the following:

1. **Points the SDK at a local server.** It creates an `OpenAI` client with `baseURL` from your environment and registers it as the SDK's default client. Because most local servers implement the Chat Completions API (not the Responses API), it switches the SDK to `chat_completions` and disables tracing so nothing is uploaded to OpenAI.
2. **Defines two tools** with `tool()` and Zod parameter schemas:
   - `get_weather` — fetches current conditions for a city from [wttr.in](https://wttr.in) (no API key needed).
   - `send_email` — a placeholder; its `execute` function is empty and does not send anything yet.
3. **Creates the agent** with instructions, both tools, and an `outputType` schema, so the final answer is parsed into:

   ```ts
   {
     city: string;        // name of the city
     degree_c: number;    // temperature in °C
     condition?: string;  // e.g. "Partly cloudy"
   }
   ```

4. **Runs a sample query** — `what is the weather in patna` — and logs the result.

## Requirements

- Node.js 18 or newer (the project uses ES modules)
- A running local model server that exposes an OpenAI-compatible `/v1` endpoint
- A model on that server that supports tool/function calling

## Setup

```bash
npm install
```

Create a `.env` file in the project root:

```env
baseURL=http://localhost:11434/v1
model=llama3.1
```

| Variable  | Description                                                        |
| --------- | ------------------------------------------------------------------ |
| `baseURL` | Base URL of your OpenAI-compatible server (include the `/v1` path) |
| `model`   | Name of the model to use, as your server knows it                  |

The example values above are for Ollama; adjust them for your server. No API key is required — the client sends a dummy key that local servers ignore.

## Run

```bash
npm start
```

This runs `node agent-tool.js`, which prints the full run result. The structured answer is in `result.finalOutput`.

To ask a different question, change the argument passed to `main(...)` at the bottom of `agent-tool.js`.

## Project structure

```
.
├── agent-tool.js   # agent, tools, and entry point
├── package.json
└── .env            # your local config (not committed)
```

## Next steps

- Implement `send_email` (for example with Nodemailer or an email API) so the agent can email the weather report.
- Log only `result.finalOutput` instead of the whole result object.
- Read the query from the command line (`process.argv`) instead of hard-coding it.
