const { ModalSubmitInteraction } = require("discord.js");
const { dbGet, dbWrite, dbId } = require("../../db");

module.exports.name = "instruction";

/**
 * @param {ModalSubmitInteraction} interaction
 */
module.exports.execute = async function (interaction) {
  let instructionId = interaction.customId.split('/')[1];
  let data;
  let created = false;
  if (instructionId) {
    data = dbGet(["instructions", interaction.guildId], instructionId)
  } else {
    instructionId = dbId();
    created = true;
    data = {
      instructionId,
      guildId: interaction.guildId,
    }
  }

  data.text = interaction.fields.getTextInputValue('text');
  data.guildName = interaction.guild.name;
  dbWrite(["instructions", interaction.guildId], instructionId, data);
  interaction.reply({
    content: '# Instruction `' + instructionId + '` ' + (created ? 'created' : 'updated') + '\n```\n' + data.text + '\n```'
  })
};
