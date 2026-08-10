import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { parse } from "yaml";
import {
  validateMusicIntegrity,
  type MusicIntegrityAlbum,
  type MusicIntegrityDiagnostic,
  type MusicIntegrityReview,
  type MusicIntegrityTrack,
} from "../../src/utils/musicIntegrity";

export type MusicContentCheckResult = {
  tracks: MusicIntegrityTrack[];
  albums: MusicIntegrityAlbum[];
  diagnostics: MusicIntegrityDiagnostic[];
};

export async function checkMusicContent(
  projectRoot: string,
  reviews: readonly MusicIntegrityReview[],
): Promise<MusicContentCheckResult> {
  const musicRoot = path.join(projectRoot, "src/content/music");
  const albumRoot = path.join(projectRoot, "src/content/albums");
  const diagnostics: MusicIntegrityDiagnostic[] = [];
  const tracks = await readRecords<MusicIntegrityTrack>(
    musicRoot,
    (id, raw) => ({
      id,
      albumId: stringValue(raw.albumId),
      trackNumber: numberValue(raw.trackNumber),
      coverImage: stringValue(raw.coverImage),
    }),
    diagnostics,
  );
  const albums = await readRecords<MusicIntegrityAlbum>(
    albumRoot,
    (id) => ({ id }),
    diagnostics,
  );

  diagnostics.push(...validateMusicIntegrity(tracks, albums, reviews));
  diagnostics.sort(
    (a, b) =>
      a.entryId.localeCompare(b.entryId) || a.field.localeCompare(b.field),
  );
  return { tracks, albums, diagnostics };
}

async function readRecords<T>(
  root: string,
  project: (id: string, raw: Record<string, unknown>) => T,
  diagnostics: MusicIntegrityDiagnostic[],
): Promise<T[]> {
  const files = await findYamlFiles(root);
  const records: T[] = [];

  for (const absolutePath of files) {
    const id = toPosix(path.relative(root, absolutePath)).replace(
      /\.(yaml|yml|json)$/i,
      "",
    );
    try {
      const raw = parse(await readFile(absolutePath, "utf8"));
      if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
        throw new Error("内容必须是对象。");
      }
      records.push(project(id, raw as Record<string, unknown>));
    } catch (error) {
      diagnostics.push({
        severity: "error",
        entryId: toPosix(path.relative(process.cwd(), absolutePath)),
        field: "content",
        message: `YAML 解析失败：${error instanceof Error ? error.message : String(error)}`,
      });
    }
  }
  return records;
}

async function findYamlFiles(root: string): Promise<string[]> {
  const entries = await readdir(root, { withFileTypes: true, recursive: true });
  return entries
    .filter(
      (entry) => entry.isFile() && /\.(yaml|yml|json)$/i.test(entry.name),
    )
    .map((entry) => path.join(entry.parentPath, entry.name))
    .sort();
}

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function numberValue(value: unknown): number | undefined {
  return typeof value === "number" ? value : undefined;
}

function toPosix(value: string): string {
  return value.split(path.sep).join("/");
}
