const fs = require("fs");
const path = require("path");

const distDir = path.resolve(__dirname, "../dist/esm");

function renameFiles(dir) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    if (file.endsWith(".bin.js")) return;
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      renameFiles(fullPath); // Recursively call for subdirectories
    } else if (file.endsWith(".js")) {
      const newPath = fullPath.replace(".js", ".mjs");
      fs.renameSync(fullPath, newPath);
    }
  });
}

renameFiles(distDir);
