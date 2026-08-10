import process from "node:process";
import { checkBlogContent } from "./lib/blogContentFiles";
import { checkMusicContent } from "./lib/musicContentFiles";

const blogResult = await checkBlogContent(process.cwd());
const musicResult = await checkMusicContent(
  process.cwd(),
  blogResult.entries.map((entry) => ({
    id: entry.id,
    isAlbumReview:
      entry.data.category === "life" && entry.data.lifeCategory === "album",
    albumId: entry.data.albumId,
  })),
);
const diagnostics = [...blogResult.diagnostics, ...musicResult.diagnostics];
const errors = diagnostics.filter(
  (diagnostic) => diagnostic.severity === "error",
);
const warnings = diagnostics.filter(
  (diagnostic) => diagnostic.severity === "warning",
);

for (const diagnostic of diagnostics) {
  const label = diagnostic.severity === "error" ? "ERROR" : "WARN";
  console.log(
    `${label} ${diagnostic.entryId} [${diagnostic.field}] ${diagnostic.message}`,
  );
}

console.log(
  `Content integrity: ${blogResult.entries.length} blog entries, ${musicResult.tracks.length} tracks, ${musicResult.albums.length} albums, ${errors.length} errors, ${warnings.length} warnings.`,
);

if (errors.length > 0) {
  process.exitCode = 1;
}
