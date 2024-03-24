import { format } from "prettier";
import type { IMarkdownImprover } from "./MarkdownStructureImprover";
import type { IContentExtractor } from "./ChromiumContentExtractor";
import type { IContentConverter } from "./MarkdownConverter";

export class ContentProcessor {
  private contentExtractor: IContentExtractor;
  private contentConverter: IContentConverter;
  private markdownImprover: IMarkdownImprover;

  constructor(
    contentExtractor: IContentExtractor,
    contentConverter: IContentConverter,
    markdownImprover: IMarkdownImprover
  ) {
    this.contentExtractor = contentExtractor;
    this.contentConverter = contentConverter;
    this.markdownImprover = markdownImprover;
  }

  async processContent(url: string): Promise<string> {
    const extractedContent = await this.contentExtractor.extractContent(url);
    const markdownContent =
      this.contentConverter.convertContent(extractedContent);
    const formattedContent = await format(markdownContent, {
      parser: "markdown",
    });
    const improvedMarkdown =
      await this.markdownImprover.improveMarkdownStructure(formattedContent);
    return improvedMarkdown;
  }
}
