const { ModalSubmitInteraction } = require("discord.js");
const { dbGet, dbWrite } = require("../../db");
const { getGuildInfo } = require("../../util");

module.exports.name = "system-prompt";

/**
 * @param {ModalSubmitInteraction} interaction
 */
module.exports.execute = async function (interaction) {
  const data = dbGet("guilds", interaction.guildId);
  data.guild = getGuildInfo(interaction.guild);
  data.prompt = interaction.fields.getTextInputValue('prompt');
  data.template = interaction.fields.getTextInputValue('template');
  data.model = interaction.fields.getTextInputValue('model');
  data.contextSize = parseInt(interaction.fields.getTextInputValue('contextSize'));
  dbWrite("guilds", interaction.guildId, data);
  interaction.reply({
    content: '# Comoderator settings updated\n\n## LLM model\n`' + data.model + '`\n## System prompt\n```\n' + data.prompt.substring(0, 1000) + '\n```\n## Moderation request prompt\n```\n' + data.template.substring(0, 1000) + '\n```'
  })
};
