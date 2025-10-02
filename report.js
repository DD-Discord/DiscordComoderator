const { Message, EmbedBuilder } = require("discord.js");
const { maxLength, sanitizeWhitespace } = require('./fmt');

/**
 * @param {Message} message
 * @param {{reason: string, action: string}} report
 * @param {{pingId: string?}} options
 */
function buildReportEmbed(message, report, options) {
  const embed = new EmbedBuilder()
    .setColor('Red')
    .setTitle('Comoderator flagged a message')
    .setURL(message.url)
    .setDescription('Please review the report and take action accordingly.')
    .setFooter({ text: 'Comoderator is an AI and can make mistakes. Comoderators LLM is locally hosted, no data leaves the server.' });

  embed.setAuthor({
    name: message.author.username,
    iconURL: message.author.avatarURL(),
  });

  embed.addFields([
    { name: ':e_mail: Offending message', value: '> ' + maxLength(sanitizeWhitespace(message.content), 500), },
    { name: ':page_facing_up: Comoderator report', value: '> ' + maxLength(report.reason, 1000), },
    { name: ':information_source: Comoderator recommendation', value: '> Comoderator recommends the following action: ' + report.action},
  ]);

  return { embeds: [embed], content: options.pingId ? `<@&${options.pingId}>` : undefined, allowedMentions: { roles: options.pingId ? [options.pingId] : [] } };
}
module.exports.buildReportEmbed = buildReportEmbed;
