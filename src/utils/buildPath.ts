import { existsSync, mkdirSync, writeFileSync } from "fs";
type File = { type: "file"; content: string };
type Dir = { type: "dir" };
type FileOrDir = File | Dir;
export default function buildPath(path: string, opts: FileOrDir) {
  const paths = path.split("/");
  const lastPath = paths.pop();
  if (!lastPath) return;
  let currentPath = "";
  try {
    for (const path of paths) {
      if (!path) {
        currentPath += `/`;
        continue;
      }
      currentPath += path;
      if (existsSync(currentPath)) {
        currentPath += `/`;
        continue;
      }
      mkdirSync(currentPath);
      currentPath += "/";
    }
    currentPath += lastPath;
    if (existsSync(currentPath)) return;
    if (opts.type === "dir") {
      mkdirSync(currentPath);
    } else {
      writeFileSync(currentPath, opts.content, { encoding: "utf-8" });
    }
  } catch (error) {
    console.error($lf(32), "Failed to build path");
    console.error($lf(33), error);
  }
}
function $lf(n: number) {
  return "$lf|src/utils/buildPath.ts:" + n + " >";
  // Automatically injected by Log Location Injector vscode extension
}
