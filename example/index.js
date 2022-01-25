const _ = require("lodash");
const fs = require("fs");
const yaml = require("js-yaml");
const percentile = require("percentile");
const { simulate } = require("../src/index.js");

const artifacts = yaml.load(fs.readFileSync("./example/data/artifacts.yaml"));
const builds = yaml.load(fs.readFileSync("./example/data/builds.yaml"));

const simulations = simulate({
  builds,
  artifacts,
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
