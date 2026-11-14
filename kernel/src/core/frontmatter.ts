import YAML from "yaml";

export interface ParsedDocument<T = unknown> {
  data: T;
  body: string;
}

/**
 * Split a Markdown document into YAML frontmatter and body.
 * A document without frontmatter is treated as an empty frontmatter plus body.
 */
export function parseFrontmatter<T = unknown>(text: string): ParsedDocument<T> {
  const normalized = text.replace(/\r\n/g, "\n");
  if (!normalized.startsWith("---\n")) {
    return { data: {} as T, body: normalized };
  }

  const end = normalized.indexOf("\n---", 4);
  if (end === -1) {
    throw new Error("Unterminated YAML frontmatter");
  }

  const raw = normalized.slice(4, end);
  const body = normalized.slice(end + 4).replace(/^\n+/, "");
  return { data: (YAML.parse(raw) ?? {}) as T, body };
}

export function stringifyFrontmatter(data: unknown, body: string): string {
  const yaml = YAML.stringify(data).trimEnd();
  return `---\n${yaml}\n---\n\n${body.replace(/^\n+/, "").trimEnd()}\n`;
}
