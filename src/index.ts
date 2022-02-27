import _ from "lodash";
import { assertType } from "typescript-is";

import {
  Artifact,
  ArtifactSet,
  ArtifactSlotKey,
  Build,
  GenshinOpenOpjectDescription,
  SimulationResult,
} from "./types";

import { artifactSets } from "./loadData";

import artifactMatchesCriteria from "./artifactMatchesCriteria";
import farmArtifacts from "./farmArtifacts";
import findMatchingArtifacts from "./findMatchingArtifacts";

const validateBuild = ({ build }: { build: Build }): void => {
  assertType<Build>(build);
  if (!_.isEmpty(build.slotsCriteria)) {
    const slotKeyCounts = _.countBy(
      build.slotsCriteria,
      (slotCriteria) => slotCriteria.slotKey
    );
    const slotKey = _.findKey(slotKeyCounts, (count) => count > 1);
    if (!_.isNil(slotKey)) {
      throw `For build "${build.id}" found ${slotKeyCounts[slotKey]} slot criteria for slot key "${slotKey}".`;
    }
  }
};

const validateBuilds = ({ builds }: { builds: Build[] }): void => {
  const buildIdCounts = _.countBy(builds, (build) => build.id);
  const buildId = _.findKey(buildIdCounts, (count) => count > 1);
  if (!_.isNil(buildId)) {
    throw `Multiple specified builds had the same id: ${buildId}`;
  }
  _.forEach(builds, (build) => validateBuild({ build }));
};

const fixMissingSlotCriteria = ({
  build,
  slotKey,
}: {
  build: Build;
  slotKey: ArtifactSlotKey;
}): void => {
  if (
    _.isNil(
      _.find(
        build.slotsCriteria,
        (slotCriteria) => slotCriteria.slotKey === slotKey
      )
    )
  ) {
    build.slotsCriteria.push({ slotKey });
  }
};

const initializeBuild = ({ build }: { build: Build }): void => {
  delete build.artifacts;
  delete build.missingSlotsCriteria;
  build.resinSpent = 0;
  _.forEach(build.setsCriteria, (setCriteria) => {
    setCriteria.set = _.find(
      artifactSets,
      (set) => set.key === setCriteria.setKey
    );
  });
  fixMissingSlotCriteria({ build, slotKey: ArtifactSlotKey.flower });
  fixMissingSlotCriteria({ build, slotKey: ArtifactSlotKey.plume });
  fixMissingSlotCriteria({ build, slotKey: ArtifactSlotKey.sands });
  fixMissingSlotCriteria({ build, slotKey: ArtifactSlotKey.goblet });
  fixMissingSlotCriteria({ build, slotKey: ArtifactSlotKey.circlet });
};

const initializeArtifact = ({ artifact }: { artifact: Artifact }): void => {
  delete artifact.build;
};

const initialize = ({
  builds,
  artifacts,
}: {
  builds: Build[];
  artifacts: Artifact[];
}): void => {
  _.forEach(builds, (build) => initializeBuild({ build }));
  _.forEach(artifacts, (artifact) => initializeArtifact({ artifact }));
};

const farm = ({
  build,
  set,
  cumulativeNewArtifacts,
}: {
  build: Build;
  set: ArtifactSet;
  cumulativeNewArtifacts: Artifact[];
}) => {
  const { artifacts, resinCost } = farmArtifacts({ set });
  build.resinSpent += resinCost;
  cumulativeNewArtifacts.push(...artifacts);
  return artifacts;
};

const simulateOnce = ({
  builds,
  artifacts,
}: {
  builds: Build[];
  artifacts: Artifact[];
}): SimulationResult => {
  initialize({ builds, artifacts });
  _.forEach(builds, (build) => {
    findMatchingArtifacts({ build, artifacts });
    while (_.size(build.artifacts) < build.slotsCriteria.length) {
      const setCriteria = _.find(
        build.setsCriteria,
        (setCriteria) =>
          _.filter(
            build.artifacts,
            (artifact) => artifact.setKey === setCriteria.setKey
          ).length < setCriteria.setBonus
      );
      let newArtifacts = [];
      const cumulativeNewArtifacts = [];
      while (
        _.isEmpty(
          _.intersectionWith(
            newArtifacts,
            build.missingSlotsCriteria,
            (artifact, slotCriteria) =>
              artifactMatchesCriteria({
                artifact,
                artifactSlotCriteria: slotCriteria,
                setKey: _.get(setCriteria, "setKey"),
              })
          )
        )
      ) {
        newArtifacts = farm({
          build,
          set: _.get(setCriteria, "set"),
          cumulativeNewArtifacts,
        });
      }
      artifacts.push(...cumulativeNewArtifacts);
      findMatchingArtifacts({ build, artifacts });
    }
  });
  return {
    totalResinSpent: _.sumBy(builds, (build) => (build as Build).resinSpent),
    builds: _.map(builds, (build) => _.pick(build, ["key", "resinSpent"])),
  } as SimulationResult;
};

export * from "./types";
export * from "./loadData";

const simulate = (
  {
    builds = [],
    goodData = { artifacts: [] },
    runs = 1,
  }: {
    builds?: Build[];
    goodData?: GenshinOpenOpjectDescription;
    runs?: number;
  } = { builds: [], goodData: { artifacts: [] }, runs: 1 }
): SimulationResult[] => {
  validateBuilds({ builds });
  assertType<GenshinOpenOpjectDescription>(goodData);
  assertType<number>(runs);
  return _.times(runs, () =>
    simulateOnce({
      builds: _.cloneDeep(builds),
      artifacts: _.cloneDeep(goodData.artifacts),
    })
  );
};

export default simulate;
