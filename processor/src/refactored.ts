import type { Project, Task, TodoistApi } from '@doist/todoist-api-typescript';
import type { OpenAI } from 'langchain/llms/openai';
import dotenv from 'dotenv';

export class TaskExtractor {
  constructor(private todoistApi: TodoistApi) {}
  async extractProjects(): Promise<Project[]> {
    return [] as Project[];
  }
  async extractTasksByProject(project: Project): Promise<Task[]> {
    return [] as Task[];
  }
}

export class TaskEnricher {
  constructor(private todoistApi: TodoistApi) {}
  async enrichTask(task: Task, urlContentMap: Map<string, string>): Promise<Task> {
    return task;
  }
}

export class UrlParser {
  async extractUrls(text: string): Promise<string[]> {
    return [] as string[];
  }
}

export class ContentFetcher {
  constructor(private openaiApi: OpenAI) {}
  async fetchContent(urls: string[]): Promise<string> {
    return '';
  }
}

export class MarkdownProcessor {
  async processMarkdown(markdown: string): Promise<string> {
    return '';
  }
}

export class TextImprover {
  async improveText(content: string, description: string): Promise<string> {
    return '';
  }
}

export class StarbeamProcessor {
  constructor(private args: StarbeamProcessorArgs) {}
  async process() {}
}

export type StarbeamProcessorArgs = {
  todoistApiKey: string;
  openaiApiKey: string;
  openaiModel: string;
  todoistProjectName: string;
};

export type EnvKeys = {
  TODOIST_API_KEY: string;
  OPENAI_API_KEY: string;
  OPENAI_MODEL: string;
  TODOIST_PROJECT_NAME: string;
};

const main = async () => {
  const { error, parsed } = dotenv.config();
  if (error) {
    throw new Error('Failed to load .env file.');
  }
  // Verify that all the required keys are present
  const requiredKeys = ['TODOIST_API_KEY', 'OPENAI_API_KEY', 'OPENAI_MODEL', 'TODOIST_PROJECT_NAME'];
  requiredKeys.forEach((key) => {
    if (!parsed?.[key]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  });
  const starbeamProcessorArgs = {
    todoistApiKey: parsed?.TODOIST_API_KEY,
    openaiApiKey: parsed?.OPENAI_API_KEY,
    openaiModel: parsed?.OPENAI_MODEL,
    todoistProjectName: parsed?.TODOIST_PROJECT_NAME,
  };
  const processor = new StarbeamProcessor(starbeamProcessorArgs as StarbeamProcessorArgs);
  await processor.process();
};

main();
