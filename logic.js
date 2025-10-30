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
    const guildSettings = dbGet("guilds", message.guildId);
    if (guildSettings.report) {
      const reportChannel = await message.guild.channels.fetch(guildSettings.report.channel.id);
      reportChannel.send(buildReportEmbed(message, report, guildSettings));
    }
  }
}


module.exports.moderateMessage = moderateMessage;