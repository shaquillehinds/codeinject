exports.default = ({ orig }) => {
  newContents = orig.replace(/from[^"]+(['"][./][^"]+)['"]/gm, 'from $1.mjs"');

  return newContents;
};
