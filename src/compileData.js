const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

const DATA_DIR = "./data";
const COMPILED_DATA_DIR = "./compiledData";

const files = fs.readdirSync(DATA_DIR);
if (!fs.existsSync(COMPILED_DATA_DIR)) {
  fs.mkdirSync(COMPILED_DATA_DIR);
}
for (const file of files) {
  const data = yaml.load(fs.readFileSync(path.join(DATA_DIR, file)));
  fs.writeFileSync(
    path.join(COMPILED_DATA_DIR, path.parse(file).name + ".json"),
    JSON.stringify(data)
  );
}
