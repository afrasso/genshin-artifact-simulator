import _ from "lodash";

import {
  ArtifactDomain,
  ArtifactDropRatesForSlot,
  ArtifactDropsForSource,
  ArtifactSet,
  ArtifactSource,
  ArtifactSubstatCount,
  ArtifactXpAmount,
} from "./types";

import rawArtifactDomains from "../compiledData/artifactDomains.json";
import rawArtifactSets from "../compiledData/artifactSets.json";
import rawArtifactDropRatesBySlot from "../compiledData/artifactDropRatesBySlot.json";
import rawArtifactDropsBySource from "../compiledData/artifactDropsBySource.json";
import rawMiscData from "../compiledData/artifactMiscData.json";

export const artifactDomains: ArtifactDomain[] = _.map(
  rawArtifactDomains as ArtifactDomain[],
  (domain) => {
    domain.sets = [];
    return domain;
  }
);

export const bossArtifactSets: ArtifactSet[] = [];
export const artifactSets: ArtifactSet[] = _.map(
  rawArtifactSets as ArtifactSet[],
  (set) => {
    if (set.source === ArtifactSource.domain) {
      set.domain = _.find(
        artifactDomains,
        (domain) => domain.key === set.domainKey
      );
      set.domain.sets.push(set);
    } else {
      bossArtifactSets.push(set);
    }
    return set;
  }
);

let slotRngMin = 0;
export const artifactDropRatesBySlot: ArtifactDropRatesForSlot[] = _.map(
  rawArtifactDropRatesBySlot as ArtifactDropRatesForSlot[],
  (dropRatesForSlot) => {
    dropRatesForSlot.rngMin = slotRngMin;
    dropRatesForSlot.rngMax = slotRngMin + dropRatesForSlot.chance;
    let statRngMin = 0;
    dropRatesForSlot.dropRatesByStat = _.map(
      dropRatesForSlot.dropRatesByStat,
      (dropRatesForStat) => {
        dropRatesForStat.rngMin = statRngMin;
        dropRatesForStat.rngMax = statRngMin + dropRatesForStat.chance;
        let substatRngMin = 0;
        dropRatesForStat.dropRatesBySubstat = _.map(
          dropRatesForStat.dropRatesBySubstat,
          (dropRatesForSubstat) => {
            dropRatesForSubstat.rngMin = substatRngMin;
            dropRatesForSubstat.rngMax =
              substatRngMin + dropRatesForSubstat.chance;
            substatRngMin = dropRatesForSubstat.rngMax;
            return dropRatesForSubstat;
          }
        );
        statRngMin = dropRatesForStat.rngMax;
        return dropRatesForStat;
      }
    );
    slotRngMin = dropRatesForSlot.rngMax;
    return dropRatesForSlot;
  }
);

export const artifactDropsBySource: ArtifactDropsForSource[] = _.map(
  rawArtifactDropsBySource as ArtifactDropsForSource[],
  (dropsForSource) => {
    dropsForSource.drops = _.map(dropsForSource.drops, (drop) => {
      let rngMin = 0;
      drop.dropCounts = _.map(drop.dropCounts, (dropCount) => {
        dropCount.rngMin = rngMin;
        dropCount.rngMax = dropCount.chance + rngMin;
        rngMin = dropCount.rngMax;
        return dropCount;
      });
      return drop;
    });
    return dropsForSource;
  }
);

export const artifactXpAmounts: ArtifactXpAmount[] = rawMiscData.xpAmounts;

let countRngMin = 0;
export const artifactSubstatCounts: ArtifactSubstatCount[] = _.map(
  rawMiscData.substatCounts as ArtifactSubstatCount[],
  (substatCount) => {
    substatCount.rngMin = countRngMin;
    substatCount.rngMax = countRngMin + substatCount.chance;
    countRngMin = substatCount.rngMax;
    return substatCount;
  }
);
