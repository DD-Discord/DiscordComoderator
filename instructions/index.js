const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require("discord.js");
const addInstructionButton = require('../interactions/buttons/add-instruction');
const instructionModal = require('../interactions/modals/instruction');

/**
 * An instruction for the LLM.
 * @typedef {Object} Instruction
 * @property {string} instructionId
 * @property {string} guildId
 * @property {string} guildName
 * @property {string} text
 */

/**
 * @param {Instruction} instruction 
 * @returns {ModalBuilder}
 */
function buildInstructionModal(instruction = {}) {
  const modalId = instruction.instructionId 
    ? instructionModal.name + '/' + instruction.instructionId 
    : instructionModal.name;
  const modal = new ModalBuilder()
    .setCustomId(modalId)
    .setTitle("Moderation instruction");

  const text = new TextInputBuilder()
    .setCustomId("text")
    .setLabel("Text")
    .setPlaceholder("Explain the moderation instruction in one or two sentences.")
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(true)
    .setValue(instruction.text ?? '');
  const textRow = new ActionRowBuilder().addComponents(text);

  modal.addComponents(textRow);
  return modal;
}
module.exports.buildInstructionModal = buildInstructionModal;

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
        name: 'Instruction `' + instruction.instructionId + '`',
        value: '```\n' + instruction.text + '\n```',
      }
    ])
  }

  const addButton = new ButtonBuilder()
    .setCustomId(addInstructionButton.name)
    .setLabel('Add new instruction')
    .setStyle(ButtonStyle.Primary);

  const row = new ActionRowBuilder()
    .addComponents(addButton);

  return { embeds: [embed], components: [row] };
}
module.exports.buildInstructionsEmbed = buildInstructionsEmbed;
