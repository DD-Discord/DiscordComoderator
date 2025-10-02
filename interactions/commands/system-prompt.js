const { CommandInteraction, SlashCommandBuilder, Message, Channel, Collection, Attachment } = require("discord.js");
const { dbWrite } = require("../../db");
const { PermissionFlagsBits } = require('discord-api-types/v10');
const { parseRulesFromMessage } = require("../../rules");
const { wrapInCode } = require('../../fmt');
const { getSystemPrompt } = require("../../prompt");

module.exports.name = "comoderator-system-prompt";

module.exports.data = new SlashCommandBuilder()
  .setName(module.exports.name)
  .setDescription("Gets the system prompt current used by the Comoderator.")
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);
    

/**
 * @param {CommandInteraction} interaction
 */
module.exports.execute = async function(interaction) {
  const systemPrompt = getSystemPrompt(interaction.guild);
  if (!systemPrompt) {
    return interaction.reply({
      content: '# No system prompt found\nComoderator is not enabled on this server.'
    });
  }
  
  // Done
  return interaction.reply({
    content: `# System prompt\nSee attachment for the system prompt.`,
    files: [{
      attachment: Buffer.from(systemPrompt, 'utf-8'),
      name: interaction.guild.id + '.txt',
    }],
  })
};
