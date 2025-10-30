const dotenv = require("dotenv");

dotenv.config();
dotenv.config({ path: ".env.local", override: true });

const { DISCORD_TOKEN, DISCORD_CLIENT_ID, OLLAMA_HOST, OLLAMA_CLOUD_API_KEY } = process.env;

if (!DISCORD_TOKEN || !DISCORD_CLIENT_ID || !OLLAMA_HOST) {
  throw new Error("Missing environment variables");
}

if (!OLLAMA_CLOUD_API_KEY) {
  console.warn('No API key found, running in local-only mode.');
}

module.exports = {
  DISCORD_TOKEN,
  DISCORD_CLIENT_ID,
  OLLAMA_HOST,
  OLLAMA_CLOUD_API_KEY,
};
