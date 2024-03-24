import { ChromiumContentExtractor } from "./src/ChromiumContentExtractor";
import { ContentProcessor } from "./src/ContentProcessor";
import { MarkdownConverter } from "./src/MarkdownConverter";
import { MarkdownStructureImprover } from "./src/MarkdownStructureImprover";

async function main() {
  try {
    const inputJson = Bun.argv[2];
    const inputObj = JSON.parse(inputJson);
    const url = inputObj.url;
    if (!url || !url.startsWith("http")) {
      console.error("Invalid URL provided. Please provide a valid URL.");
      return;
    }

    const contentExtractor = new ChromiumContentExtractor();
    const contentConverter = new MarkdownConverter();
    const markdownImprover = new MarkdownStructureImprover();
    const contentProcessor = new ContentProcessor(
      contentExtractor,
      contentConverter,
      markdownImprover
    );

    const improvedMarkdown = await contentProcessor.processContent(url);
    return { content: improvedMarkdown };
  } catch (error) {
    console.error("Error processing Markdown file:", error);
    if (error instanceof Error) {
      return { error: error.message };
    } else {
      return { error: "An unknown error occurred." };
    }
  }
}

main().then(console.log);
