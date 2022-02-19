export interface Artifact {
  setKey: string;
  slotKey: ArtifactSlotKey;
  rarity: number;
  mainStatKey: ArtifactStatKey;
  substats?: ArtifactSubstat[];
  build?: Build;
}

export interface ArtifactDomain {
  key: string;
  name: string;
  sets?: ArtifactSet[];
}

export interface ArtifactDrop {
  rarity: number;
  dropCounts: ArtifactDropCount[];
}

export interface ArtifactDropCount {
  num: number;
  chance: number;
  rngMin?: number;
  rngMax?: number;
}

export interface ArtifactDropRatesForSlot {
  slotKey: ArtifactSlotKey;
  chance: number;
  dropRatesByStat: ArtifactDropRatesForStat[];
  rngMin?: number;
  rngMax?: number;
}

export interface ArtifactDropRatesForStat {
  statKey: ArtifactStatKey;
  chance: number;
  dropRatesBySubstat: ArtifactDropRatesForSubstat[];
  rngMin?: number;
  rngMax?: number;
}

export interface ArtifactDropRatesForSubstat {
  statKey: ArtifactStatKey;
  chance: number;
  rngMin?: number;
  rngMax?: number;
}

export interface ArtifactDropsForSource {
  source: ArtifactSource;
  drops: ArtifactDrop[];
}

export interface ArtifactSet {
  key: string;
  name: string;
  source: ArtifactSource;
  domainKey: string;
  domain?: ArtifactDomain;
}

export enum ArtifactSetBonus {
  onePiece = 1,
  twoPiece = 2,
  fourPiece = 4,
}

export interface ArtifactSetCriteria {
  setKey: string;
  setBonus: ArtifactSetBonus;
  set?: ArtifactSet;
}

export enum ArtifactSlotKey {
  flower = "flower",
  plume = "plume",
  sands = "sands",
  goblet = "goblet",
  circlet = "circlet",
}

export interface ArtifactSlotCriteria {
  slotKey: ArtifactSlotKey;
  mainStatKey?: ArtifactStatKey;
  minValue?: number;
  substats?: ArtifactSubstatCriteria[];
}

export enum ArtifactSource {
  boss = "boss",
  domain = "domain",
}

export enum ArtifactStatKey {
  anemo_dmg_ = "anemo_dmg_",
  atk = "atk",
  atk_ = "atk_",
  critDMG_ = "critDMG_",
  critRate_ = "critRate_",
  cryo_dmg_ = "cryo_dmg_",
  def = "def",
  def_ = "def_",
  electro_dmg_ = "electro_dmg_",
  eleMas = "eleMas",
  enerRech_ = "enerRech_",
  geo_dmg_ = "geo_dmg_",
  heal_ = "heal_",
  hp = "hp",
  hp_ = "hp_",
  hydro_dmg_ = "hydro_dmg_",
  physical_dmg_ = "physical_dmg_",
  pyro_dmg_ = "pyro_dmg_",
}

export interface ArtifactSubstat {
  key: ArtifactStatKey;
}

export interface ArtifactSubstatCount {
  count: number;
  chance: number;
  rngMin?: number;
  rngMax?: number;
}

export interface ArtifactSubstatCriteria {
  key: ArtifactStatKey;
  minValue?: number;
}

export interface ArtifactXpAmount {
  rarity: number;
  xp: number;
}

export interface Build {
  id: string;
  name: string;
  setsCriteria: ArtifactSetCriteria[];
  slotsCriteria: ArtifactSlotCriteria[];
  artifacts?: Artifact[];
  missingSlotsCriteria?: ArtifactSlotCriteria[];
  resinSpent?: number;
}

export interface GenshinOpenOpjectDescription {
  artifacts: Artifact[];
}

export interface SimulationResult {
  totalResinSpent: number;
  builds: { key: string; resinSpent?: number }[];
}
