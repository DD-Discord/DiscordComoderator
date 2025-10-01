const { ButtonInteraction } = require("discord.js");
const instructions = require("../../instructions");

module.exports.name = "add-instruction";

/**
 * @param {ButtonInteraction} interaction
 */
module.exports.execute = async function (interaction) {
  interaction.showModal(instructions.buildInstructionModal());
};
