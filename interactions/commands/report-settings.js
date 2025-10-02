const { CommandInteraction, SlashCommandBuilder } = require("discord.js");
const { dbWrite } = require("../../db");
const { PermissionFlagsBits } = require('discord-api-types/v10');

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
module.exports.execute = async function(interaction) {
  /** @type {import("discord.js").Channel} */
  const channel = interaction.options.getChannel("channel");
  /** @type {import("discord.js").Role} */
  const ping = interaction.options.getRole("ping");

  dbWrite("channels", interaction.guildId, {
    id: channel.id,
    name: channel.name,
    pingId: ping?.id,
    pingName: ping?.name,
  });
  
  // Done
  return interaction.reply({
    content: `Bound to channel \`${channel.id}\``,
  })
};
