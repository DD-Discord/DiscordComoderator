const { CommandInteraction, SlashCommandBuilder } = require("discord.js");
const { dbDelete } = require("../../db");
const { PermissionFlagsBits } = require('discord-api-types/v10');

module.exports.name = "comoderator-delete-instruction";

module.exports.data = new SlashCommandBuilder()
  .setName(module.exports.name)
  .setDescription("Sets the system prompt for the Comoderator LLM.")
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addStringOption(option => {
    option.setName("instruction-id");
    option.setDescription("The ID of the instruction to delete.");
    option.setRequired(true);
    return option;
  });
    

/**
 * @param {CommandInteraction} interaction
 */
module.exports.execute = async function(interaction) {
  const instructionId = interaction.options.getString("instruction-id");

  dbDelete(["instructions", interaction.guildId], instructionId);
  
  // Done
  return interaction.reply({
    content: `Instruction \`${instructionId}\` deleted`,
  })
};
