const { Message } = require("discord.js");
const { dbGet } = require("./db");
const { Ollama } = require('ollama');
const { getSystemPrompt, getModerationPrompt } = require("./prompt");
const { sanitizeWhitespace, COLOR } = require("./fmt");
const { OLLAMA_HOST, OLLAMA_CLOUD_API_KEY } = require("./config");

const ollama = new Ollama({
  host: OLLAMA_HOST,
  headers: OLLAMA_CLOUD_API_KEY && {
    Authorization: "Bearer " + OLLAMA_CLOUD_API_KEY,
  },
});

/**
 * A LLM report
 * @typedef {Object} Report
 * @property {boolean} flag
 * @property {string} action
 * @property {string} reason
 * @property {string} thoughts
 */

/**
 * Runs the LLM on the given message
 * @param {Message} message The message.
 * @returns {Promise<Report?>} Once done
 */
async function generateReport(message) {
  if (message.author.bot || message.author.system) {
    return null;
  }

  const data = dbGet("guilds", message.guildId);
  const systemPrompt = getSystemPrompt(message.guild);
  const moderationPrompt = getModerationPrompt(message);
  if (!systemPrompt || !moderationPrompt || !data) {
    return null;
  }

  const context = await message.channel.messages.fetch({
    before: message.id,
    limit: data.contextSize,
  });
  const previous = context.map(getModerationPrompt);

  const response = await ollama.chat({
    model: data.model,
    think: false,
    format: {
      "type": "object",
      "properties": {
        "flag": {
          "type": "boolean"
        },
        "action": {
          "type": "string"
        },
        "reason": {
          "type": "string"
        }
      },
      "required": [
        "flag",
        "action"
      ],
    },
    messages: [
      { role: "system", content: systemPrompt },
      ...previous.map(content => ({ role: "user", content })),
      { role: "user", content: moderationPrompt },
    ],
  })

  let content = response.message.content;
  // Some models wrap code in Markdown tags
  if (content.startsWith('```json')) {
    content = content.substring(8);
    content = content.substring(0, content.length - 4)
  }

  let json;
  try {
    json = JSON.parse(content);
    json.thoughts = response.message.thinking ? sanitizeWhitespace(response.message.thinking) : 'No further thoughts.';
    console.log(`${COLOR.FG_MAGENTA}${message.author.username}${COLOR.RESET} ${COLOR.DIM}(${message.channel.name} in ${message.guild.name})${COLOR.RESET}: ${sanitizeWhitespace(message.content)}\n${COLOR.DIM}${json.thoughts}${COLOR.RESET}\n`, json);
  } catch (error) {
    console.error('Received invalid JSON', response.message.content);
    return null;
  }

  return json;
}
module.exports.generateReport = generateReport;
