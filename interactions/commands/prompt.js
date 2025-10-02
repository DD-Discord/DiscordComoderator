const { CommandInteraction, SlashCommandBuilder, Role, ModalBuilder, TextInputBuilder, ActionRowBuilder } = require("discord.js");
const { dbGet, dbWrite } = require("../../db");
const { PermissionFlagsBits, TextInputStyle } = require('discord-api-types/v10');
const dedent = require('string-dedent');
const systemPromptModal = require('../modals/system-prompt');

module.exports.name = "comoderator-prompt";

module.exports.data = new SlashCommandBuilder()
  .setName(module.exports.name)
  .setDescription("Sets the system prompt for the Comoderator LLM.")
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);
    

/**
 * @param {CommandInteraction} interaction
 */
module.exports.execute = async function(interaction) {
  let data = dbGet("prompts", interaction.guildId);
  if (data === null) {
    data = {
      guildId: interaction.guildId,
      guildName: interaction.guild.name,
      // The system prompt
      prompt: dedent`
      You are a Discord bot called 'Comoderator' on the server '{guildName}'. Your job is to alert moderators about suspicious messages.

      You will receive user messages in this format:
      {template}

      And respond with a JSON message in the following format:
      {
        "flag": boolean,
        "action": "string",
        "reason": "string",
      }

      - "flag" is either true or false, if true the moderators will be alerted.
      - "action" contains a string of the action you would recommend the moderators to take. The following actions are available, in decreasing severity:
        - "Ban user"
        - "Warn user"
        - "Delete message"
        - "Nothing"
      - "reason" is the reason as to why the moderators should be alerted / take this action.
      Only ever respond in the specified JSON format.

      The moderators have left you with the following instructions on which messages to flag:
      {instructions}
      `,
      // The template for a single message to moderate
      template: dedent`
      User: {userName}
      Display Name: {displayName}
      Discord account creation date: {accountAge} (Today is {now})
      Roles: {roles}
      Sent in channel: {channelName}
      Message: {message}
      `,
      // Ignore separator roles by default
      ignoreRolesRegex: `$\.\.\.\.\.`,
      model: 'gpt-oss:20b',
    };
  }

  const modal = new ModalBuilder()
    .setCustomId(systemPromptModal.name)
    .setTitle("Edit Comoderator System Prompt");

  const model = new TextInputBuilder()
    .setCustomId("model")
    .setLabel("LLM model to use")
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setValue(data.model);
  const modelRow = new ActionRowBuilder().addComponents(model);

  const prompt = new TextInputBuilder()
    .setCustomId("prompt")
    .setLabel("LLM system prompt")
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(true)
    .setValue(data.prompt);
  const promptRow = new ActionRowBuilder().addComponents(prompt);

  const template = new TextInputBuilder()
    .setCustomId("template")
    .setLabel("Prompt for user messages")
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(true)
    .setValue(data.template);
  const templateRow = new ActionRowBuilder().addComponents(template);

  modal.addComponents(modelRow, promptRow, templateRow);

  dbWrite("prompts", interaction.guildId, data);
  
  // Done
  return interaction.showModal(modal);
};
