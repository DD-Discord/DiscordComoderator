const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const addInstruction = require('../interactions/buttons/add-instruction');

/**
 * An instruction for the LLM.
 * @typedef {Object} Instruction
 * @property {string} instructionId
 * @property {string} guildId
 * @property {string} guildName
 * @property {string} text
 */


/**
 * @param {Instruction[]} instructions 
 * @returns {{embeds: EmbedBuilder[], components: ActionRowBuilder[] }}
 */
function buildInstructionsEmbed(instructions) {
  const embed = new EmbedBuilder();
  embed.setTitle('All instructions for the Comoderator')
  embed.setDescription('This lists all instructions that are passed to the Comoderator LLM to take into account when moderating messages. The most specific the better.');

  for (const instruction of instructions) {
    embed.addFields([
      {
        name: 'a',
        value: 'a',
      }
    ])
  }

  const addButton = new ButtonBuilder()
    .setCustomId(addInstruction.name)
    .setLabel('Add new instruction')
    .setStyle(ButtonStyle.Primary);

  const row = new ActionRowBuilder()
    .addComponents(addButton);

  return { embeds: [embed], components: [row] };
}
module.exports.buildInstructionsEmbed = buildInstructionsEmbed;
