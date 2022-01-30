const sets = require("../compiledData/sets.json");

const domains = {};
const bossArtifactSets = [];
sets.forEach((set) => {
  if (set.source === "domain") {
    if (!domains[set.domain]) {
      domains[set.domain] = { name: set.domain, sets: [] };
    }
    domains[set.domain].sets.push(set);
    set.domain = domains[set.domain];
  } else {
    bossArtifactSets.push(set);
    console.log(
      `"${set.name}" artifacts can only be obtained via normal or weekly bosses.`
    );
  }
});

for (const domain in domains) {
  const sets = domains[domain].sets;
  if (sets.length != 2) {
    console.error(
      `The domain "${domain}" does not have two artifact sets associated with it.`
    );
  }
}

module.exports = { bossArtifactSets, domains, sets };
