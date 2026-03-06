const fs = require("fs");
const path = require("path");

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function collectI18nKeysFromHtml(html) {
  const keyRe = /data-i18n="([^"]+)"/g;
  const keys = new Set();
  let m;
  while ((m = keyRe.exec(html))) {
    keys.add(m[1]);
  }
  return keys;
}

function unionInto(target, source) {
  for (const v of source) target.add(v);
  return target;
}

function main() {
  const root = process.cwd();
  const htmlFiles = [
    "index.html",
    "permacoat_bike_series.html",
    "permacoat_car_series.html",
  ]
    .map((f) => path.join(root, f))
    .filter((p) => fs.existsSync(p));

  const allKeys = new Set();
  for (const file of htmlFiles) {
    unionInto(allKeys, collectI18nKeysFromHtml(readText(file)));
  }

  const translations = require(path.join(root, "js", "translations.js"));
  const targetLangs = ["ko", "en", "ja", "vi", "zh", "it", "fr", "de", "am", "ar"];

  const report = {};
  for (const lang of targetLangs) {
    const dic = translations[lang] || {};
    const missing = [...allKeys].filter((k) => !(k in dic));
    report[lang] = missing.sort();
  }

  console.log("HTML files:", htmlFiles.map((p) => path.basename(p)).join(", "));
  console.log("Total data-i18n keys:", allKeys.size);
  for (const lang of targetLangs) {
    const missing = report[lang];
    console.log(`${lang} missing ${missing.length}`);
    if (missing.length) {
      console.log("  " + missing.slice(0, 80).join(", ") + (missing.length > 80 ? " ..." : ""));
    }
  }

  const totalMissing = Object.values(report).reduce((acc, arr) => acc + arr.length, 0);
  process.exit(totalMissing ? 1 : 0);
}

main();

