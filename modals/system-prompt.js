const { ModalSubmitInteraction } = require("discord.js");
const { dbGet, dbWrite } = require("../db");

module.exports.name = "system-prompt";

/**
 * @param {ModalSubmitInteraction} interaction
 */
module.exports.execute = async function (interaction) {
  const data = dbGet("prompts", interaction.guildId);
  data.guildName = interaction.guild.name;
  data.prompt = interaction.fields.getTextInputValue('prompt');
  data.template = interaction.fields.getTextInputValue('template');
  dbWrite('prompts', interaction.guildId, data);
  interaction.reply({
    content: '# LLM prompts updated\n\n## System prompt\n```\n' + data.prompt.substring(0, 1000) + '\n```\n## Moderation request prompt\n```\n' + data.template.substring(0, 1000) + '\n```'
  })
};
