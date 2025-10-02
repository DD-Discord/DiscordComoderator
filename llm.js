const { Message } = require("discord.js");
const { dbGet } = require("./db");
const { Ollama } = require('ollama');
const { getSystemPrompt, getModerationPrompt } = require("./prompt");
const { sanitizeWhitespace, COLOR } = require("./fmt");
const { OLLAMA_HOST } = require("./config");

const ollama = new Ollama({ host: OLLAMA_HOST });

/**
 * A LLM report
 * @typedef {Object} Report
 * @property {boolean} flag
 * @property {string} action
 * @property {string} reason
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

  const data = dbGet("prompts", message.guildId);
  const systemPrompt = getSystemPrompt(message.guild);
  const moderationPrompt = getModerationPrompt(message);
  if (!systemPrompt || !moderationPrompt || !data) {
    return null;
  }

  const response = await ollama.chat({
    model: data.model,
    think: false,
    messages: [
      { role: "system", content: systemPrompt },
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
    console.log(`${COLOR.FG_MAGENTA}${message.author.username}${COLOR.RESET} ${COLOR.DIM}(${message.channel.name} in ${message.guild.name})${COLOR.RESET}: ${sanitizeWhitespace(message.content)}\n`, json);
  } catch(error) {
    console.error('Received invalid JSON', response.message.content);
    return null;
  }
  
  return json;
}
module.exports.generateReport = generateReport;
