module.exports = ({ character, matchingArtifacts }) => {
  console.log(`For ${character.name}:`);
  console.log("  Found the following artifacts:");
  matchingArtifacts.artifacts.forEach((artifact) => {
    console.log(`    ${JSON.stringify(artifact)}`);
  });
  console.log("  Need the following artifacts:");
  matchingArtifacts.missingArtifactsCriteria.forEach((criteria) => {
    console.log(`    ${JSON.stringify(criteria)}`);
  });
};
