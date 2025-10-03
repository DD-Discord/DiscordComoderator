const { CommandInteraction, SlashCommandBuilder } = require("discord.js");
const { dbGet, dbWrite } = require("../../db");
const { PermissionFlagsBits, MessageFlags } = require('discord-api-types/v10');
const { wrapInCode } = require("../../fmt");

module.exports.name = "comoderator-toggle";

module.exports.data = new SlashCommandBuilder()
  .setName(module.exports.name)
  .setDescription("Turns the Comoderator on or off.")
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addBooleanOption(option => {
    option.setName("toggle");
    option.setDescription("Sets if it is enabled.");
    option.setRequired(true);
    return option;
  });

/**
 * @param {CommandInteraction} interaction
 */
module.exports.execute = async function(interaction) {
  const data = dbGet("prompts", interaction.guildId);
  if (!data) {
    return interaction.reply({
      content: `# Comoderator not set up\nSet up comoderator before disabling/enabling it.`,
    });
  }

  const toggle = interaction.options.getBoolean("toggle");
  data.enabled = toggle;

  dbWrite("prompts", interaction.guildId, data);
  
  // Done
  return interaction.reply({
    content: `# Comoderator toggled\nComoderator now enabled: ${wrapInCode(data.enabled)}`,
  });
};
