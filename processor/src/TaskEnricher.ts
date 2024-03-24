import type { Task } from '@doist/todoist-api-typescript';
import { OpenAI } from 'langchain/llms/openai';
import { StructuredOutputParser } from 'langchain/output_parsers';
import { PromptTemplate } from 'langchain/prompts';
import { RunnableSequence } from 'langchain/runnables';
import { z } from 'zod';

// Determine if the todoist library should be used for enriching tasks directly or if an abstraction layer should be created
export type EnrichTaskResponse = Pick<Task, 'content' | 'description'>;

export type EnrichedTask = Task & {
  extractedUrls: string[];
};

// TODO: Move llm implementation to a separate class and inject it into the constructor
export class TaskEnricher {
  private llm: OpenAI;
  constructor(openaiApiKey: string, openaiModel: string) {
    this.llm = new OpenAI({
      maxRetries: 3,
      modelName: openaiModel,
      apiKey: openaiApiKey,
      temperature: 0,
    });
  }

  async enrichTask(
    content: string,
    description: string,
    labels: string[],
    comments: string[],
    urlContentMap: Map<string, string>
  ): Promise<EnrichTaskResponse> {
    const parser = StructuredOutputParser.fromZodSchema(
      z.object({
        content: z.string().describe('improved and enriched task content string'),
        description: z.string().describe('improved and enriched task description string'),
      })
    );

    const chain = RunnableSequence.from([
      PromptTemplate.fromTemplate(
        'Improve and enrich the task content and description strings to improve the quality of my Todoist task definitions\n{format_instructions}\n{content}\n{description}\n{labels}\n{comments}'
      ),
      this.llm,
      parser,
    ]);

    const formatInstructions = parser.getFormatInstructions();

    const response = await chain.invoke({
      content,
      description,
      labels: labels.join(','),
      comments: comments.join(','),
      format_instructions: formatInstructions,
    });

    return response;
  }

  async extractUrls(text: string): Promise<string[]> {
    const parser = StructuredOutputParser.fromZodSchema(
      z
        .array(z.string().describe('extracted url string'))
        .describe('array of urls extracted from the task content and description')
    );

    const chain = RunnableSequence.from([
      PromptTemplate.fromTemplate('Please extract all the urls from the following text\n{format_instructions}\n{text}'),
      this.llm,
      parser,
    ]);

    const formatInstructions = parser.getFormatInstructions();

    try {
      return await chain.invoke({
        text,
        format_instructions: formatInstructions,
      });
    } catch (error) {
      console.error(error);
      return [];
    }
  }
}
