const _ = require("lodash");
const artifactMatchesCriteria = require("./artifactMatchesCriteria.js");

const rateArtifactCriteriaDifficulty = () => {
  return 0.5;
};

const findRemainingArtifacts = ({
  artifacts,
  artifactCriteria,
  set1,
  set1Count = 0,
  set2,
  set2Count = 0,
  noSetCount = 0,
}) => {
  if (artifactCriteria.length === 0) {
    return { artifacts: [], missingArtifactsCriteria: [] };
  }
  const choices = [];
  const currentArtifactCriteria = _.head(artifactCriteria);
  const remainingArtifactCriteria = _.tail(artifactCriteria);
  if (set1Count < 4 || (set1Count < 2 && set2)) {
    const artifact = _.find(artifacts, (artifact) =>
      artifactMatchesCriteria({
        artifact,
        artifactCriteria: currentArtifactCriteria,
        set: set1,
      })
    );
    const remainingArtifacts = findRemainingArtifacts({
      artifacts,
      artifactCriteria: remainingArtifactCriteria,
      set1,
      set1Count: set1Count + 1,
      set2,
      set2Count,
      noSetCount,
    });
    if (!artifact) {
      choices.push({
        artifacts: remainingArtifacts.artifacts,
        missingArtifactsCriteria: [
          currentArtifactCriteria,
          ...remainingArtifacts.missingArtifactsCriteria,
        ],
      });
    } else {
      choices.push({
        artifacts: [artifact, ...remainingArtifacts.artifacts],
        missingArtifactsCriteria: remainingArtifacts.missingArtifactsCriteria,
      });
    }
  }
  if (set2 && set2Count < 2) {
    const artifact = _.find(artifacts, (artifact) =>
      artifactMatchesCriteria({
        artifact,
        artifactCriteria: currentArtifactCriteria,
        set: set2,
      })
    );
    const remainingArtifacts = findRemainingArtifacts({
      artifacts,
      artifactCriteria: remainingArtifactCriteria,
      set1,
      set1Count,
      set2,
      set2Count: set2Count + 1,
      noSetCount,
    });
    if (!artifact) {
      choices.push({
        artifacts: remainingArtifacts.artifacts,
        missingArtifactsCriteria: [
          currentArtifactCriteria,
          ...remainingArtifacts.missingArtifactsCriteria,
        ],
      });
    } else {
      choices.push({
        artifacts: [artifact, ...remainingArtifacts.artifacts],
        missingArtifactsCriteria: remainingArtifacts.missingArtifactsCriteria,
      });
    }
  }
  if (
    noSetCount === 0 &&
    ((set1Count === 2 && set2Count === 2) || set1Count === 4)
  ) {
    const artifact = _.find(artifacts, (artifact) =>
      artifactMatchesCriteria({
        artifact,
        artifactCriteria: currentArtifactCriteria,
      })
    );
    const remainingArtifacts = findRemainingArtifacts({
      artifacts,
      artifactCriteria: remainingArtifactCriteria,
      set1,
      set1Count,
      set2,
      set2Count,
      noSetCount: noSetCount + 1,
    });
    if (!artifact) {
      choices.push({
        artifacts: remainingArtifacts.artifacts,
        missingArtifactsCriteria: [
          currentArtifactCriteria,
          ...remainingArtifacts.missingArtifactsCriteria,
        ],
      });
    } else {
      choices.push({
        artifacts: [artifact, ...remainingArtifacts.artifacts],
        missingArtifactsCriteria: remainingArtifacts.missingArtifactsCriteria,
      });
    }
  }
  return _.minBy(choices, (choice) =>
    _.sumBy(choice.missingArtifactsCriteria, (criteria) => criteria.difficulty)
  );
};

const findMatchingArtifactsForCharacter = ({ character, artifacts }) => {
  character.artifactCriteria.forEach((artifactCriteria) => {
    artifactCriteria.difficulty =
      rateArtifactCriteriaDifficulty(artifactCriteria);
  });
  const matchingArtifacts = findRemainingArtifacts({
    artifacts: _.filter(artifacts, (artifact) => !artifact.owner),
    artifactCriteria: character.artifactCriteria,
    set1: character.set1,
    set2: character.set2,
  });
  matchingArtifacts.artifacts.forEach(
    (artifact) => (artifact.owner = character.name)
  );
  return matchingArtifacts;
};

module.exports = findMatchingArtifactsForCharacter;
