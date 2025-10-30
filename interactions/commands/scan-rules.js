const { CommandInteraction, SlashCommandBuilder, Message, Channel, Collection } = require("discord.js");
const { dbWrite } = require("../../db");
const { PermissionFlagsBits } = require('discord-api-types/v10');
const { parseRulesFromMessage } = require("../../rules");
const { getGuildInfo } = require("../../util");

module.exports.name = "comoderator-scan-rules";

module.exports.data = new SlashCommandBuilder()
  .setName(module.exports.name)
  .setDescription("Updates with server rules by scanning a channel for its contets.")
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addChannelOption(option => {
    option.setName("channel");
    option.setDescription("The channel to scan for rules.");
    option.setRequired(true);
    return option;
  });


/**
 * @param {CommandInteraction} interaction
 */
module.exports.execute = async function (interaction) {
  /** @type {Channel} */
  const channel = interaction.options.getChannel("channel");
  /** @type {Collection<string, Message>>} */
  const messagesCollection = await channel.messages.fetch({ limit: 100 });
  /** @type {Message[]} */
  const messages = messagesCollection.values().toArray().reverse();

  const rules = messages.map(parseRulesFromMessage).join('\n\n');

  dbWrite('rules', interaction.guildId, {
    guild: getGuildInfo(interaction.guild),
    rules,
  });

  // Done
  return interaction.reply({
    content: `# Updated rules from ${messages.length} messages\nSee the atttachment for all rules.`,
    files: [{
      attachment: Buffer.from(rules, 'utf-8'),
      name: channel.id + '.txt',
    }],
  })
};
