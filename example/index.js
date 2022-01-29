const _ = require("lodash");
const fs = require("fs");
const yaml = require("js-yaml");
const percentile = require("percentile");
const { simulate } = require("../src/index.js");

const good = yaml.load(fs.readFileSync("./example/data/good.yaml"));
// To run this example with a GOOD JSON file, comment the above line and modify the commented line below:
// const good = require("./data/good.json");
const builds = yaml.load(fs.readFileSync("./example/data/builds.yaml"));

const simulations = simulate({
  builds,
  good,
  runs: 1000,
});

const percentiles = [5, 10, 25, 50, 75, 90, 95];
const data = percentile(
  percentiles,
  _.map(simulations, (simulation) => simulation.totalResinSpent)
);

percentiles.forEach((percentile, idx) => {
  console.log(
    `${percentile}th percentile: ${data[idx]} resin, ${
      Math.round(data[idx] / 1.8) / 100
    } days`
  );
});
