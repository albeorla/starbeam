import type { BodyElement, ExtractedContent } from "./ChromiumContentExtractor";

export interface IContentConverter {
  convertContent(content: ExtractedContent): string;
}

export class MarkdownConverter implements IContentConverter {
  convertContent(content: ExtractedContent): string {
    let markdownContent = "";

    if (content.title) {
      markdownContent += `# ${content.title}\n\n`;
    }

    const bodyElements: BodyElement[] = JSON.parse(content.body);
    bodyElements.forEach((element: BodyElement) => {
      switch (element.type) {
        case "heading":
          const level = element.level ? element.level : 1;
          markdownContent += `${"#".repeat(level)} ${element.text}\n\n`;
          break;
        case "paragraph":
          markdownContent += `${element.text}\n\n`;
          break;
      }
    });

    return markdownContent;
  }
}
