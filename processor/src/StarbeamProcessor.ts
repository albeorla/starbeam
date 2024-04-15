import { Task } from "@doist/todoist-api-typescript";
import { TaskEnricher } from "./TaskEnricher";
import { TodoistTaskHandler } from "./TodoistTaskHandler";
import { z } from "zod";

export interface StarbeamProcessorArgs {
  taskEnricher: TaskEnricher;
  todoistTaskHandler: TodoistTaskHandler;
  todoistProjectNameFilter: string;
  scraper: { run: (url: string, params: any) => void }
}

export class StarbeamProcessor {
  private taskEnricher: TaskEnricher;
  private todoistTaskHandler: TodoistTaskHandler;
  private todoistProjectNameFilter: string;
  private scraper: any;

  constructor({
    todoistProjectNameFilter,
    taskEnricher,
    todoistTaskHandler,
    scraper,
  }: StarbeamProcessorArgs) {
    this.taskEnricher = taskEnricher;
    this.todoistTaskHandler = todoistTaskHandler;
    this.todoistProjectNameFilter = todoistProjectNameFilter;
    this.scraper = scraper;
  }

  async run() {
    // Extract all the projects
    // const projects = await this.todoistTaskHandler.extractProjects();

    // Extract all the tasks from the projects
    // const projectTasks = await this.todoistTaskHandler.extractTasksByProject(
      // projects,
      // this.todoistProjectNameFilter
    // );

    // Process tasks
    // await this.processTasks(projectTasks);
    const schema = z.object({
      title: z.string().describe("the title of the webpage"),
      summary: z.string().describe("a summary of the webpage's content"),
    });
    await this.processContent("https://platform.openai.com/docs/models/gpt-4-turbo-and-gpt-4", schema);
  }

  async processContent(url: string, schema: any): Promise<void> {
    // Run the scraper
    const pages = await this.scraper.run(url, {
      schema,
      model: "gpt-4-0125-preview",
      mode: "html",
      closeOnFinish: true,
      temperature: 0.25,
    });

    for await (const page of pages) {
      console.log(page);
    }
  }

  async getUrlContentMap(
    extractedUrls: string[]
  ): Promise<Map<string, string>> {
    const urlContentMap = new Map<string, string>();

    
    extractedUrls.forEach(async (url) => {
      // const processed = await this.processContent(url, null);
      // urlContentMap.set(url, processed);
    });
    return urlContentMap;
  }

  private async processTasks(projectTasks: Task[]) {
    await Promise.all(
      projectTasks.map(async (task: Task) => {
        // Extract the content, description, and labels from the task
        const { content, description, labels } = task;

        // Get associated comments
        const comments = await this.todoistTaskHandler.extractCommentsByTask(
          task.id
        );

        const text = [content, description, ...comments];
        const extractedUrls = await Promise.all(
          text.map((text) => this.taskEnricher.extractUrls(text))
        );
        const urlContentMap = await this.getUrlContentMap(extractedUrls.flat());

        // Enrich the task content and description using:
        // - the content and description themselves
        // - the labels
        // - the comments
        // - the markdown content scraped from the urls
        const { content: enrichedContent, description: enrichedDescription } =
          await this.taskEnricher.enrichTask(
            content,
            description,
            labels,
            comments
          );

        this.todoistTaskHandler.updateTask(
          task.id,
          enrichedContent,
          enrichedDescription
        );

        const extractedUrlComment = `Extracted URLs:\n${Array.from(
          urlContentMap.keys()
        )
          .map((url) => `- ${url}`)
          .join("\n")}`;
        this.todoistTaskHandler.addComment(task.id, extractedUrlComment);
      })
    );
  }
}
