import { webkit, type Page } from 'playwright';

export type BodyElement = {
  type: string;
  level?: number;
  text?: string;
};

export type ExtractedContent = {
  title: string;
  body: string;
};

export class WebkitContentExtractor {
  async extractContent(url: string): Promise<ExtractedContent> {
    const browser = await webkit.launch();
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle' });
    const pageContent = await this.getPageContent(page);
    await page.close();
    return pageContent;
  }

  private async getPageContent(page: Page): Promise<ExtractedContent> {
    const title = await page.title();
    const contentElements = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6, p'));
      return elements.map((element) => ({
        type: element.tagName.toLowerCase().startsWith('h') ? 'heading' : 'paragraph',
        level: element.tagName.toLowerCase().startsWith('h') ? parseInt(element.tagName.slice(1), 10) : undefined,
        text: element.textContent || '',
      }));
    });
    return { title, body: JSON.stringify(contentElements) };
  }
}
