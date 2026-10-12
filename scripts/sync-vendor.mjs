// Copy the loan app source and the generated color tokens into vendor/, so this repo builds on its own.
// Run after changing either sibling project: npm run sync
import { cpSync, existsSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const app = join(root, "../shecluded-loan-app/src");
const tokens = join(root, "../tokens");
if (!existsSync(app) || !existsSync(tokens)) throw new Error("Expected ../shecluded-loan-app and ../tokens next to this folder.");

rmSync(join(root, "vendor"), { recursive: true, force: true });
cpSync(app, join(root, "vendor/loan-app/src"), { recursive: true });
for (const f of ["pairings.json", "source.json"]) cpSync(join(tokens, f), join(root, "vendor/tokens", f));
console.log("vendor/ updated from ../shecluded-loan-app/src and ../tokens");
