import remarkMdx from "remark-mdx";
import remarkMath from "remark-math";
import remarkParse from "remark-parse";
import { unified } from "unified";

type AstNode = {
  type: string;
  value?: string;
  children?: AstNode[];
};

const BLOCKED_NODE_TYPES = new Set([
  "code",
  "inlineCode",
  "html",
  "image",
  "imageReference",
  "math",
  "inlineMath",
  "mdxFlowExpression",
  "mdxTextExpression",
  "mdxJsxFlowElement",
  "mdxJsxTextElement",
  "mdxjsEsm",
]);

const SEPARATOR_NODE_TYPES = new Set([
  "paragraph",
  "heading",
  "blockquote",
  "listItem",
  "tableRow",
]);

function collectPlainText(node: AstNode, output: string[]) {
  if (BLOCKED_NODE_TYPES.has(node.type)) return;
  if (node.type === "text" && node.value) {
    output.push(node.value);
    return;
  }

  for (const child of node.children ?? []) {
    collectPlainText(child, output);
  }

  if (SEPARATOR_NODE_TYPES.has(node.type)) output.push("\n");
}

export function normalizeSpaceText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

export function countSpaceTextUnits(value: string): number {
  return Array.from(normalizeSpaceText(value).replace(/\s/g, "")).length;
}

export function truncateSpaceText(value: string, maximumUnits = 88): string {
  const normalized = normalizeSpaceText(value);
  if (maximumUnits <= 0) return "";

  let units = 0;
  let result = "";
  for (const character of normalized) {
    if (!/\s/u.test(character)) units += 1;
    if (units > maximumUnits) break;
    result += character;
  }

  const trimmed = result.trim();
  if (units >= countSpaceTextUnits(normalized)) return trimmed;

  const minimumBoundary = Math.floor(trimmed.length * 0.55);
  const sentenceBoundary = Math.max(
    trimmed.lastIndexOf("。"), trimmed.lastIndexOf("！"), trimmed.lastIndexOf("？"),
    trimmed.lastIndexOf("."), trimmed.lastIndexOf("!"), trimmed.lastIndexOf("?"),
    trimmed.lastIndexOf("；"), trimmed.lastIndexOf(";"),
  );
  const wordBoundary = trimmed.lastIndexOf(" ");
  const boundary = sentenceBoundary >= minimumBoundary ? sentenceBoundary + 1 : wordBoundary >= minimumBoundary ? wordBoundary : trimmed.length;
  return `${trimmed.slice(0, boundary).trim()}…`;
}

export function extractBlogPlainText(source: string): string {
  const tree = unified()
    .use(remarkParse)
    .use(remarkMath)
    .use(remarkMdx)
    .parse(source) as AstNode;
  const output: string[] = [];
  collectPlainText(tree, output);
  return normalizeSpaceText(output.join(""));
}

export function extractBlogExcerpt(source: string, maximumUnits = 88) {
  const plainText = extractBlogPlainText(source);
  return {
    plainText,
    textLength: countSpaceTextUnits(plainText),
    excerpt: truncateSpaceText(plainText, maximumUnits),
  };
}
