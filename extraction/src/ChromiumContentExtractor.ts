import type { Browser, Page } from "playwright";
import { chromium, webkit } from "playwright";

export interface BodyElement {
  type: string;
  level?: number;
  text?: string;
}

export interface ExtractedContent {
  title: string;
  body: string;
}

export interface IContentExtractor {
  extractContent(url: string): Promise<ExtractedContent>;
}

export class ChromiumContentExtractor implements IContentExtractor {
  private async launchBrowser(): Promise<Browser> {
    return await webkit.launch({ headless: true });
  }

  private async getPageContent(page: Page): Promise<ExtractedContent> {
    const title = await page.title();
    const contentElements = await page.evaluate(() => {
      const elements = Array.from(
        document.querySelectorAll("h1, h2, h3, h4, h5, h6, p")
      );
      return elements.map((element) => ({
        type: element.tagName.toLowerCase().startsWith("h")
          ? "heading"
          : "paragraph",
        level: element.tagName.toLowerCase().startsWith("h")
          ? parseInt(element.tagName.slice(1), 10)
          : undefined,
        text: element.textContent || "",
      }));
    });
    return { title, body: JSON.stringify(contentElements) };
  }

  async extractContent(url: string): Promise<ExtractedContent> {
    const browser = await this.launchBrowser();
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle" });
    const content = await this.getPageContent(page);
    await browser.close();
    return content;
  }
}