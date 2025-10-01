const { Message, EmbedBuilder } = require("discord.js");

/**
 * @param {Message} message
 * @param {string} report
 */
function buildReportEmbed(message, report, options) {
  const embed = new EmbedBuilder()
    .setColor('Red')
    .setTitle('Comoderator flagged a message')
    .setURL(message.url)
    .setDescription('Please review the report and take action accordingly.')
    .setFooter({ text: 'Comoderator is an AI and can make mistakes. ' });

  embed.setAuthor({
    name: message.author.username,
    iconURL: message.author.avatarURL(),
  });

  embed.addFields([
    { name: ':e_mail: Offending message', value: message.content, },
    { name: ':page_facing_up: Comoderator report', value: report, },
  ]);

  return { embeds: [embed], content: options.pingId ? `<@&${options.pingId}>` : undefined, allowedMentions: { roles: options.pingId ? [options.pingId] : [] } };
}
module.exports.buildReportEmbed = buildReportEmbed;