import { Project, Task, TodoistApi } from '@doist/todoist-api-typescript';
import { PromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { config } from 'dotenv';
import { OpenAI } from 'langchain/llms/openai';
import { StructuredOutputParser } from 'langchain/output_parsers';
import { z } from 'zod';
import { MarkdownConverter } from './MarkdownConverter';
import { WebContentToMarkdownProcessor } from './WebContentToMarkdownProcessor';
import { WebkitContentExtractor } from './WebkitContentExtractor';
import { TodoistTaskHandler } from './TodoistTaskHandler';

export type EnvKeys = {
  TODOIST_API_KEY: string;
  OPENAI_API_KEY: string;
  OPENAI_MODEL: string;
  TODOIST_PROJECT_NAME: string;
};

export type StarbeamProcessorArgs = {
  todoistApiKey: string;
  openaiApiKey: string;
  openaiModel: string;
  todoistProjectName: string;
};




class ContentProcessor {
  constructor(private webContentToMarkdownProcessor: WebContentToMarkdownProcessor) {}

  async processContent(url: string): Promise<string> {
    return this.webContentToMarkdownProcessor.processContent(url);
  }

  async getUrlContentMap(extractedUrls: string[]): Promise<Map<string, string>> {
    const urlContentMap = new Map<string, string>();
    extractedUrls.forEach(async (url) => {
      const processed = await this.webContentToMarkdownProcessor.processContent(url);
      urlContentMap.set(url, processed);
    });
    return urlContentMap;
  }
}

export class StarbeamProcessor {
  private llm: OpenAI;
  private todoistApi: TodoistApi;
  private todoistProjectFilter: RegExp;
  private taskEnricher: TaskEnricher;
  private contentProcessor: ContentProcessor;
  private todoistTaskHandler: TodoistTaskHandler;
  private webContentToMarkdownProcessor: WebContentToMarkdownProcessor;

  constructor({ todoistApiKey, openaiApiKey, openaiModel, todoistProjectName }: StarbeamProcessorArgs) {
    this.todoistApi = new TodoistApi(todoistApiKey);
    this.todoistProjectFilter = new RegExp(todoistProjectName, 'i');

    this.llm = new OpenAI({
      maxRetries: 3,
      modelName: openaiModel,
      apiKey: openaiApiKey,
      temperature: 0,
    });

    const markdownConverter = new MarkdownConverter();
    const webkitContentExtractor = new WebkitContentExtractor();

    this.webContentToMarkdownProcessor = new WebContentToMarkdownProcessor(webkitContentExtractor, markdownConverter);
    this.taskEnricher = new TaskEnricher(openaiApiKey, openaiModel);
    this.contentProcessor = new ContentProcessor(this.webContentToMarkdownProcessor);
    this.todoistTaskHandler = new TodoistTaskHandler(this.todoistApi);
  }

  async process() {
    // Extract all the projects
    const projects = await this.todoistTaskHandler.extractProjects();

    // Extract all the tasks from the projects
    const projectTasks = await this.todoistTaskHandler.extractTasksByProject(projects, this.todoistProjectFilter);

    // Process each task
    await Promise.all(
      projectTasks.map(async (task) => {
        // Extract the content, description, and labels from the task
        const { content, description, labels } = task;

        // Get associated comments
        // const comments = (await this.todoistApi.getComments({ taskId: task.id })).map((comment) => comment.content);
        const comments = await this.todoistTaskHandler.extractCommentsByTask(task.id);

        const text = [content, description, ...comments];
        const extractedUrls = await Promise.all(text.map((text) => this.taskEnricher.extractUrls(text)));
        const urlContentMap = await this.contentProcessor.getUrlContentMap(extractedUrls.flat());

        // Enrich the task content and description using:
        // - the content and description themselves
        // - the labels
        // - the comments
        // - the markdown content scraped from the urls
        const { content: enrichedContent, description: enrichedDescription } = await this.taskEnricher.enrichTask(
          content,
          description,
          labels,
          comments,
          urlContentMap
        );

        this.todoistTaskHandler.updateTask(task.id, enrichedContent, enrichedDescription);

        const extractedUrlComment = `Extracted URLs:\n${Array.from(urlContentMap.keys())
          .map((url) => `- ${url}`)
          .join('\n')}`;
        this.todoistTaskHandler.addComment(task.id, extractedUrlComment);
      })
    );
  }
}

async function main() {
  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  });

  const { error, parsed } = config();

  if (error) throw new Error('Error parsing .env file', error);

  const {
    TODOIST_API_KEY: todoistApiKey,
    OPENAI_API_KEY: openaiApiKey,
    OPENAI_MODEL: openaiModel,
    TODOIST_PROJECT_NAME: todoistProjectName,
  } = parsed as EnvKeys;

  const starbeamProcessor = new StarbeamProcessor({
    todoistApiKey,
    openaiApiKey,
    openaiModel,
    todoistProjectName,
  });

  await starbeamProcessor.process();
}

main();
