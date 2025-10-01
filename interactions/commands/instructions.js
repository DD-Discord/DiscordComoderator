const { CommandInteraction, SlashCommandBuilder } = require("discord.js");
const { dbGetAll } = require("../../db");
const { PermissionFlagsBits } = require('discord-api-types/v10');
const { buildInstructionsEmbed } = require("../../instructions");

module.exports.name = "comoderator-instructions";

module.exports.data = new SlashCommandBuilder()
  .setName(module.exports.name)
  .setDescription("Shows all instructions of the Comoderator LLM and allows adding new ones.")
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);


/**
 * @param {CommandInteraction} interaction
 */
module.exports.execute = async function (interaction) {
  /** @type {Instruction[]} */
  const allInstructions = dbGetAll(["instructions", interaction.guildId]);

  const embed = buildInstructionsEmbed(allInstructions);

  return interaction.reply(embed);
};
