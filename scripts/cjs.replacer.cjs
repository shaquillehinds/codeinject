exports.default = ({ orig }) => {
  newContents = orig.replace(
    /require[^"]+(['"][./][^"]+)['"]/gm,
    'require($1.cjs"'
  );

  return newContents;
};

function $lf(n) {
  return "$lf|codeinject/scripts/cjs.replacer.cjs:" + n + " >";
  // Automatically injected by Log Location Injector vscode extension
}
