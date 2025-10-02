const { CommandInteraction, SlashCommandBuilder } = require("discord.js");
const { PermissionFlagsBits } = require('discord-api-types/v10');
const { getModerationPrompt } = require("../../prompt");
const { wrapInCode } = require("../../fmt");

module.exports.name = "comoderator-moderation-prompt";

module.exports.data = new SlashCommandBuilder()
  .setName(module.exports.name)
  .setDescription("Gets the moderation prompt current used by the Comoderator.")
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addStringOption(option => {
    option.setName("message-id");
    option.setDescription("The ID of the message to apply the template to.");
    option.setRequired(true);
    return option;
  });
    

/**
 * @param {CommandInteraction} interaction
 */
module.exports.execute = async function(interaction) {
  const messageId = interaction.options.getString("message-id");

  // Fetch message
  /** @type {Message} */
  let message;
  try {
    message = await interaction.channel.messages.fetch(messageId);
  } catch (error) {
    console.error(error);
    return interaction.reply({
      content: `# Could not get moderation prompt\nFailed to fetch message with ID ${messageId}. The error is: \n${wrapInCode(`${error}`)}`,
    });
  }

  const moderationPrompt = getModerationPrompt(message);
  if (!moderationPrompt) {
    return interaction.reply({
      content: '# No moderation prompt found\nComoderator is not enabled on this server.'
    });
  }
  
  // Done
  return interaction.reply({
    content: `# Moderation prompt\nSee attachment for the moderation prompt.`,
    files: [{
      attachment: Buffer.from(moderationPrompt, 'utf-8'),
      name: message.id + '.txt',
    }],
  })
};
