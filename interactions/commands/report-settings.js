const { CommandInteraction, SlashCommandBuilder } = require("discord.js");
const { dbWrite, dbGet } = require("../../db");
const { PermissionFlagsBits } = require('discord-api-types/v10');
const { getChannelInfo, getRoleInfo } = require("../../util");

module.exports.name = "comoderator-report-settings";

module.exports.data = new SlashCommandBuilder()
  .setName(module.exports.name)
  .setDescription("Sets the report settings to use.")
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addChannelOption(option => {
    option.setName("channel");
    option.setDescription("The channel to bind to.");
    option.setRequired(true);
    return option;
  })
  .addRoleOption(option => {
    option.setName("ping");
    option.setDescription("A role to ping when a report comes in.");
    option.setRequired(false);
    return option;
  });


/**
 * @param {CommandInteraction} interaction
 */
module.exports.execute = async function (interaction) {
  /** @type {import("discord.js").Channel} */
  const channel = interaction.options.getChannel("channel");
  /** @type {import("discord.js").Role} */
  const ping = interaction.options.getRole("ping");

  const data = dbGet("guilds", interaction.guildId);
  if (!data) {
    return interaction.reply({
      content: '# No settings found\nComoderator is not enabled on this server.'
    });
  }

  data.report = {
    channel: getChannelInfo(channel),
    ping: getRoleInfo(ping),
  };

  // Done
  return interaction.reply({
    content: `Bound to channel \`${channel.id}\``,
  })
};
