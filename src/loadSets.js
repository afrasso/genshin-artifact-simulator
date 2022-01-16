const fs = require("fs");
const yaml = require("js-yaml");

const sets = yaml.load(fs.readFileSync("./data/sets.yaml"));

const domains = {};
sets.forEach((set) => {
  if (set.source === "domain") {
    if (!domains[set.domain]) {
      domains[set.domain] = { sets: [] };
    }
    domains[set.domain].sets.push(set);
  } else {
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

module.exports = { domains, sets };
