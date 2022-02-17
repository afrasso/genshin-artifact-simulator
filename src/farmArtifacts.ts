import _ from "lodash";

import {
  Artifact,
  ArtifactSet,
  ArtifactDropRatesForSubstat,
  ArtifactSubstat,
} from "./types";

import {
  artifactDropRatesBySlot,
  artifactDropsBySource,
  artifactSets,
  artifactSubstatCounts,
  bossArtifactSets,
} from "./loadData";

const farmArtifacts = ({
  set = _.head(artifactSets),
}: {
  set: ArtifactSet;
}): { artifacts: Artifact[]; resinCost: number } => {
  const dropsForSource = _.find(
    artifactDropsBySource,
    (dropForSource) => dropForSource.source === set.source
  );
  const drop = _.find(dropsForSource.drops, (drop) => drop.rarity === 5);
  const dropRng = Math.random();
  const dropNum = _.find(
    drop.dropCounts,
    (dropCount) => dropRng >= dropCount.rngMin && dropRng < dropCount.rngMax
  ).num;
  return {
    artifacts: _.times(dropNum, () => {
      const possibleSets =
        set.source === "domain" ? set.domain.sets : bossArtifactSets;
      return generateArtifact({
        set: possibleSets[Math.floor(_.size(possibleSets) * Math.random())],
      });
    }),
    resinCost: set.source === "domain" ? 20 : 40,
  };
};

const generateArtifact = ({ set }: { set: ArtifactSet }): Artifact => {
  const slotRng = Math.random();
  const statRng = Math.random();
  const substatCountRng = Math.random();
  const dropRatesForSlot = _.find(
    artifactDropRatesBySlot,
    (dropRatesForSlot) =>
      slotRng >= dropRatesForSlot.rngMin && slotRng < dropRatesForSlot.rngMax
  );
  const dropRatesForStat = _.find(
    dropRatesForSlot.dropRatesByStat,
    (dropRatesForStat) =>
      statRng >= dropRatesForStat.rngMin && statRng < dropRatesForStat.rngMax
  );
  const substatCount = _.find(
    artifactSubstatCounts,
    (artifactSubstatCount) =>
      substatCountRng >= artifactSubstatCount.rngMin &&
      substatCountRng < artifactSubstatCount.rngMax
  );
  const substats = _.times(substatCount.count, () =>
    generateSubstat({ dropRatesBySubstat: dropRatesForStat.dropRatesBySubstat })
  );
  return {
    setKey: set.key,
    slotKey: dropRatesForSlot.slotKey,
    rarity: 5,
    mainStatKey: dropRatesForStat.statKey,
    substats,
  };
};

const generateSubstat = ({
  dropRatesBySubstat,
}: {
  dropRatesBySubstat: ArtifactDropRatesForSubstat[];
}): ArtifactSubstat => {
  const substatRng = Math.random();
  const statKey = _.find(
    dropRatesBySubstat,
    (dropRatesForSubstat) =>
      substatRng >= dropRatesForSubstat.rngMin &&
      substatRng < dropRatesForSubstat.rngMax
  ).statKey;
  return { key: statKey };
};

export default farmArtifacts;
