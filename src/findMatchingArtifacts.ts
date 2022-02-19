import _ from "lodash";

import {
  Artifact,
  ArtifactSetCriteria,
  ArtifactSlotCriteria,
  Build,
} from "./types";

import artifactMatchesCriteria from "./artifactMatchesCriteria";

const rateRemainingArtifactDifficulty = ({
  remainingArtifactSlotsCriteria,
}: {
  remainingArtifactSlotsCriteria: ArtifactSlotCriteria[];
}): number => {
  // TODO: Probably want to make this more advanced.
  return _.size(remainingArtifactSlotsCriteria);
};

const getNumArtifactsRequiredForSetCriteria = ({
  artifactSetsCriteria,
}: {
  artifactSetsCriteria: ArtifactSetCriteria[];
}): number => {
  return _.sum(
    _.map(artifactSetsCriteria, (setCriteria) => setCriteria.setBonus)
  );
};

const getNumArtifactsFoundNotForSetCriteria = ({
  artifactSetsCriteria,
  artifactSetCounts,
}: {
  artifactSetsCriteria: ArtifactSetCriteria[];
  artifactSetCounts: { key: string; count: number }[];
}): number => {
  return _.sum(
    _.map(artifactSetCounts, (setCount) =>
      _.find(
        artifactSetsCriteria,
        (setCriteria) => setCriteria.setKey === setCount.key
      )
        ? setCount.count
        : 0
    )
  );
};

const updateArtifactSetCount = ({
  artifact,
  artifactSetCounts,
}: {
  artifact: Artifact;
  artifactSetCounts?: { key: string; count: number }[];
}): void => {
  let setCount = _.find(
    artifactSetCounts,
    (setCount) => setCount.key === artifact.setKey
  );
  if (!setCount) {
    setCount = { key: artifact.setKey, count: 0 };
    artifactSetCounts.push(setCount);
  }
  setCount.count += 1;
};

interface MatchingArtifactsResult {
  artifacts: Artifact[];
  missingArtifactSlotsCriteria: ArtifactSlotCriteria[];
}

const findRemainingArtifacts = ({
  artifacts,
  artifactSlotsCriteria,
  artifactSetsCriteria,
  artifactSetCounts = [],
  includeNoSet = false,
}: {
  artifacts: Artifact[];
  artifactSlotsCriteria: ArtifactSlotCriteria[];
  artifactSetsCriteria: ArtifactSetCriteria[];
  artifactSetCounts?: { key: string; count: number }[];
  includeNoSet?: boolean;
}): MatchingArtifactsResult => {
  if (_.size(artifactSlotsCriteria) === 0) {
    return { artifacts: [], missingArtifactSlotsCriteria: [] };
  }
  const currentArtifactSlotCriteria = _.head(artifactSlotsCriteria);
  const remainingArtifactSlotsCriteria = _.tail(artifactSlotsCriteria);
  const results: MatchingArtifactsResult[] = _.filter(
    _.map(artifactSetsCriteria, (setCriteria) => {
      if (artifactSetCounts[setCriteria.setKey] === setCriteria.setBonus) {
        return;
      }
      const artifact = _.find(artifacts, (artifact) =>
        artifactMatchesCriteria({
          artifact,
          artifactSlotCriteria: currentArtifactSlotCriteria,
          setKey: setCriteria.setKey,
        })
      );
      if (artifact) {
        updateArtifactSetCount({ artifact, artifactSetCounts });
      }
      const remainingArtifacts = findRemainingArtifacts({
        artifacts,
        artifactSlotsCriteria: remainingArtifactSlotsCriteria,
        artifactSetsCriteria,
        artifactSetCounts,
        includeNoSet,
      });
      if (artifact) {
        return {
          artifacts: [artifact, ...remainingArtifacts.artifacts],
          missingArtifactSlotsCriteria:
            remainingArtifacts.missingArtifactSlotsCriteria,
        } as MatchingArtifactsResult;
      }
      return {
        artifacts: remainingArtifacts.artifacts,
        missingArtifactSlotsCriteria: [
          currentArtifactSlotCriteria,
          ...remainingArtifacts.missingArtifactSlotsCriteria,
        ],
      } as MatchingArtifactsResult;
    }),
    (result) => !_.isNil(result)
  );
  if (
    5 - getNumArtifactsRequiredForSetCriteria({ artifactSetsCriteria }) <
    getNumArtifactsFoundNotForSetCriteria({
      artifactSetsCriteria,
      artifactSetCounts,
    })
  ) {
    let artifact: Artifact;
    if (includeNoSet) {
      artifact = _.find(artifacts, (artifact) =>
        artifactMatchesCriteria({
          artifact,
          artifactSlotCriteria: currentArtifactSlotCriteria,
        })
      );
    }
    if (artifact) {
      updateArtifactSetCount({ artifact, artifactSetCounts });
    }
    const remainingArtifacts = findRemainingArtifacts({
      artifacts,
      artifactSlotsCriteria: remainingArtifactSlotsCriteria,
      artifactSetsCriteria,
      artifactSetCounts,
      includeNoSet,
    });
    if (artifact) {
      results.push({
        artifacts: [artifact, ...remainingArtifacts.artifacts],
        missingArtifactSlotsCriteria:
          remainingArtifacts.missingArtifactSlotsCriteria,
      } as MatchingArtifactsResult);
    } else {
      results.push({
        artifacts: remainingArtifacts.artifacts,
        missingArtifactSlotsCriteria: [
          currentArtifactSlotCriteria,
          ...remainingArtifacts.missingArtifactSlotsCriteria,
        ],
      } as MatchingArtifactsResult);
    }
  }
  const result = _.minBy(results, (result) =>
    rateRemainingArtifactDifficulty({
      remainingArtifactSlotsCriteria: result.missingArtifactSlotsCriteria,
    })
  );
  return result;
};

const findMatchingArtifacts = ({
  build,
  artifacts,
}: {
  build: Build;
  artifacts: Artifact[];
}): void => {
  let matchingArtifactsResult = findRemainingArtifacts({
    artifacts: _.filter(
      artifacts,
      (artifact) => !artifact.build || artifact.build.id === build.id
    ),
    artifactSlotsCriteria: build.slotsCriteria,
    artifactSetsCriteria: build.setsCriteria,
  });
  if (matchingArtifactsResult.artifacts.length === 4) {
    matchingArtifactsResult = findRemainingArtifacts({
      artifacts: _.filter(
        artifacts,
        (artifact) => !artifact.build || artifact.build.id === build.id
      ),
      artifactSlotsCriteria: build.slotsCriteria,
      artifactSetsCriteria: build.setsCriteria,
      includeNoSet: true,
    });
  }
  _.forEach(
    matchingArtifactsResult.artifacts,
    (artifact) => (artifact.build = build)
  );
  build.artifacts = matchingArtifactsResult.artifacts;
  build.missingSlotsCriteria =
    matchingArtifactsResult.missingArtifactSlotsCriteria;
};

export default findMatchingArtifacts;
