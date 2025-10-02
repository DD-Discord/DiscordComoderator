const dotenv = require("dotenv");

dotenv.config();
dotenv.config({ path: ".env.local", override: true });

const { DISCORD_TOKEN, DISCORD_CLIENT_ID, OLLAMA_HOST } = process.env;

if (!DISCORD_TOKEN || !DISCORD_CLIENT_ID || !OLLAMA_HOST) {
  throw new Error("Missing environment variables");
}

module.exports = {
  DISCORD_TOKEN,
  DISCORD_CLIENT_ID,
  OLLAMA_HOST,
};
