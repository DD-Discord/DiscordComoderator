const { Message } = require("discord.js");
const { dbGet } = require("./db");
const { buildReportEmbed } = require('./report');
const { generateReport } = require("./llm");

/**
 * Runs the LLM on the given message
 * @param {Message} message The message.
 * @returns {Promise<void>} Once done
 */
async function moderateMessage(message) {
  const report = await generateReport(message);
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