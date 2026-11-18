import fs from "node:fs";
import path from "node:path";
import type { NextConfig } from "next";

// Which Peng pictures exist per look, so the page asks only for files that are there.
function pengFiles(): Record<string, string[]> {
  const root = path.join(__dirname, "public", "peng");
  const out: Record<string, string[]> = {};
  if (fs.existsSync(root)) {
    for (const look of fs.readdirSync(root)) {
      const dir = path.join(root, look);
      if (fs.statSync(dir).isDirectory()) out[look] = fs.readdirSync(dir).filter((f) => /^peng-.+\.(webp|png)$/.test(f));
    }
  }
  return out;
}

const nextConfig: NextConfig = {
  env: { NEXT_PUBLIC_PENG_FILES: JSON.stringify(pengFiles()) },
};

export default nextConfig;
