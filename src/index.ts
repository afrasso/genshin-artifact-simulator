import _ from "lodash";

import {
  Artifact,
  ArtifactSet,
  Build,
  GenshinOpenOpjectDescription,
} from "./types";

import { artifactSets } from "./loadData";

import artifactMatchesCriteria from "./artifactMatchesCriteria";
import farmArtifacts from "./farmArtifacts";
import findMatchingArtifacts from "./findMatchingArtifacts";

const initialize = ({
  builds,
  artifacts,
}: {
  builds: Build[];
  artifacts: Artifact[];
}) => {
  _.forEach(builds, (build) => {
    delete build.artifacts;
    delete build.missingSlotsCriteria;
    build.resinSpent = 0;
    _.forEach(build.setsCriteria, (setCriteria) => {
      setCriteria.set = _.find(
        artifactSets,
        (set) => set.key === setCriteria.setKey
      );
    });
  });
  _.forEach(artifacts, (artifact) => {
    delete artifact.build;
  });
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
}) => {
  initialize({ builds, artifacts });
  _.forEach(builds, (build) => {
    findMatchingArtifacts({ build, artifacts });
    while (_.size(build.artifacts) < 5) {
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
    builds: _.map(builds, (build) => _.pick(build, ["name", "resinSpent"])),
  };
};

export default {
  simulate: ({
    builds,
    goodData,
    runs,
  }: {
    builds: Build[];
    goodData: GenshinOpenOpjectDescription;
    runs: number;
  }) => {
    return _.times(runs, () =>
      simulateOnce({
        builds: _.cloneDeep(builds),
        artifacts: _.cloneDeep(goodData.artifacts),
      })
    );
  },
};
