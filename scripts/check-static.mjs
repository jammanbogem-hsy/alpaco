import { access, readFile } from "node:fs/promises";

const requiredFiles = ["index.html", "styles.css", "app.js", "vercel.json"];
const requiredSnippets = [
  "이상한 키오스크 월드",
  "3초 뒤 사라지는 주문 키오스크",
  "어려운 결제 키오스크",
  "외계어 메뉴 키오스크"
];

await Promise.all(requiredFiles.map((file) => access(file)));

const html = await readFile("index.html", "utf8");
const js = await readFile("app.js", "utf8");
const source = `${html}\n${js}`;

const missing = requiredSnippets.filter((snippet) => !source.includes(snippet));

if (missing.length > 0) {
  throw new Error(`Missing required content: ${missing.join(", ")}`);
}

const productImagesBlock = js.match(/const productImages = \{([\s\S]*?)\n\};/);
if (!productImagesBlock) {
  throw new Error("Missing productImages map");
}

const imagePaths = [...productImagesBlock[1].matchAll(/:\s*"([^"]+)"/g)].map((match) => match[1]);
await Promise.all(imagePaths.map((path) => access(path)));

console.log("Static app check passed.");
