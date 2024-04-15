import { config } from "dotenv";
import { StarbeamProcessor } from "./StarbeamProcessor";
import { TaskEnricher } from "./TaskEnricher";
import { TodoistTaskHandler } from "./TodoistTaskHandler";
import { TodoistApi } from "@doist/todoist-api-typescript";
import { webkit } from "playwright";
import LLMScraper from "llm-scraper";
import OpenAI from "openai";

export type EnvKeys = {
  TODOIST_API_KEY: string;
  OPENAI_API_KEY: string;
  OPENAI_MODEL: string;
  TODOIST_PROJECT_NAME: string;
};

async function main() {
  const { error, parsed } = config({
    debug: process.env.LOG_LEVEL === "trace",
  });

  if (error) throw new Error("Error parsing .env file");

  const {
    TODOIST_API_KEY: todoistApiKey,
    OPENAI_API_KEY: openaiApiKey,
    OPENAI_MODEL: openaiModel,
    TODOIST_PROJECT_NAME: todoistProjectName,
  } = parsed as EnvKeys;

  const llm = new OpenAI({
    apiKey: openaiApiKey,
    maxRetries: 5,
  });
  const todoistApi = new TodoistApi(todoistApiKey);
  const browser = await webkit.launch();

  const starbeamProcessor = new StarbeamProcessor({
    taskEnricher: new TaskEnricher(openaiApiKey, openaiModel),
    todoistTaskHandler: new TodoistTaskHandler(todoistApi),
    todoistProjectNameFilter: todoistProjectName,
    scraper: new LLMScraper(browser, llm),
  });

  await starbeamProcessor.run();
}

main();
