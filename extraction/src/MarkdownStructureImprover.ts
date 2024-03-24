import { remark } from "remark";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import { unified } from "unified";

export interface IMarkdownImprover {
  improveMarkdownStructure(content: string): Promise<string>;
}

export class MarkdownStructureImprover implements IMarkdownImprover {
  async improveMarkdownStructure(content: string): Promise<string> {
    const ast = await unified()
      .use(remarkParse)
      .use(remarkFrontmatter)
      .use(remarkGfm)
      .use(remarkStringify)
      .parse(content);

    const improvedAst = this.improveHeadingStructure(ast);
    const improvedMarkdown = await remark().stringify(improvedAst);
    return improvedMarkdown;
  }

  private improveHeadingStructure(ast: any): any {
    const topLevelHeadings = ast.children.filter(
      (node: any) => node.type === "heading" && node.depth === 1
    );
    if (topLevelHeadings.length > 1) {
      topLevelHeadings.slice(1).forEach((heading: any) => {
        heading.depth = 2;
      });
    }

    const fixHeadingIncrement = (node: any) => {
      if (node.type === "heading") {
        const prevNode = ast.children[ast.children.indexOf(node) - 1];
        if (prevNode && prevNode.type === "heading") {
          const diff = node.depth - prevNode.depth;
          if (diff > 1) {
            node.depth = prevNode.depth + 1;
          }
        }
      }
      if (node.children) {
        node.children.forEach(fixHeadingIncrement);
      }
    };
    fixHeadingIncrement(ast);

    return ast;
  }
}
