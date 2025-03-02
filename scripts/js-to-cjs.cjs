const fs = require("fs");
const path = require("path");

const distDir = path.resolve(__dirname, "../dist/cjs");

function renameFiles(dir) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      renameFiles(fullPath); // Recursively call for subdirectories
    } else if (file.endsWith(".js")) {
      const newPath = fullPath.replace(".js", ".cjs");
      fs.renameSync(fullPath, newPath);
    }
  });
}

renameFiles(distDir);
