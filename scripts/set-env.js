const fs = require("fs");
const path = require("path");
require("dotenv").config();

const apiKey = process.env.GOOGLE_MAPS_API_KEY ?? "";
const mapId = process.env.GOOGLE_MAPS_MAP_ID ?? "";

if (!apiKey || !mapId) {
  console.error(
    "GOOGLE_MAPS_API_KEY ou GOOGLE_MAPS_MAP_ID manquant. Copie .env.example vers .env.",
  );
  process.exit(1);
}

const targetDir = path.join(__dirname, "..", "src", "environments");
fs.mkdirSync(targetDir, { recursive: true });

fs.writeFileSync(
  path.join(targetDir, "environment.ts"),
  `export const environment = {
  production: ${process.argv.includes("--prod")},
  googleMaps: {
    apiKey: ${JSON.stringify(apiKey)},
    mapId: ${JSON.stringify(mapId)}
  }
};
`,
);
