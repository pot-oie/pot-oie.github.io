import process from "node:process";
import { checkBlogContent } from "./lib/blogContentFiles";

const result = await checkBlogContent(process.cwd());
const errors = result.diagnostics.filter(
  (diagnostic) => diagnostic.severity === "error",
);
const warnings = result.diagnostics.filter(
  (diagnostic) => diagnostic.severity === "warning",
);

for (const diagnostic of result.diagnostics) {
  const label = diagnostic.severity === "error" ? "ERROR" : "WARN";
  console.log(
    `${label} ${diagnostic.entryId} [${diagnostic.field}] ${diagnostic.message}`,
  );
}

console.log(
  `Blog content integrity: ${result.entries.length} entries, ${errors.length} errors, ${warnings.length} warnings.`,
);

if (errors.length > 0) {
  process.exitCode = 1;
}
