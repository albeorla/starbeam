import { format } from "prettier";
import type { MarkdownConverter } from "./MarkdownConverter";
import type { WebkitContentExtractor } from "./WebkitContentExtractor";

export class WebContentToMarkdownProcessor {
  constructor(
    private contentExtractor: WebkitContentExtractor,
    private contentConverter: MarkdownConverter
  ) {
    this.contentConverter = contentConverter;
    this.contentExtractor = contentExtractor;
  }

  async processContent(url: string): Promise<string> {
    const extractedContent = await this.contentExtractor.extractContent(url);
    const markdownContent =
      this.contentConverter.convertContent(extractedContent);
    const formattedContent = await format(markdownContent, {
      parser: "markdown",
    });
    const improvedMarkdown =
      await this.contentConverter.improveMarkdownStructure(formattedContent);
    return improvedMarkdown;
  }
}
