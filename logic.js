const { Message } = require("discord.js");
const { dbGet } = require("./db");
const { default: ollama } = require('ollama');
const { buildReportEmbed } = require('./report');
const { getSystemPrompt, getModerationPrompt } = require("./prompt");
const { generateReport } = require("./llm");

const COLOR = {
  RESET: '\x1b[0m',
  DIM: "\x1b[2m",
  FG_MAGENTA: "\x1b[35m"
}

const WHITESPACE_REGEX = /\s+/g;

/**
 * Runs the LLM on the given message
 * @param {Message} message The message.
 * @returns {Promise<void>} Once done
 */
async function moderateMessage(message) {
  const report = generateReport(message);
  if (!report) {
    return;
  }

  if (report.flag) {
    const channelData = dbGet("channels", message.guildId);
    if (channelData) {
      const reportChannel = await message.guild.channels.fetch(channelData.id);
      reportChannel.send(buildReportEmbed(message, report, channelData));
    }
  }
}


module.exports.moderateMessage = moderateMessage;