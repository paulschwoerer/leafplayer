const fs = require("fs");

const pkg =  JSON.parse(fs.readFileSync("./package.json"));

const {
  name,
  version,
  description,
  author,
  license,
  engines,
  dependencies,
} = pkg;

fs.writeFileSync("./dist/package.json", JSON.stringify({
  name,
  version,
  description,
  author,
  license,
  main: "main.js",
  bin: {
    leafplayer: "./main.js"
  },
  engines,
  bundledDependencies: true,
  dependencies,
}, null, 2));
