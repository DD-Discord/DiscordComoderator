const { Message, EmbedBuilder } = require("discord.js");
const { maxLength, sanitizeWhitespace } = require('./fmt');
const { OLLAMA_CLOUD_API_KEY } = require("./config");
const { RoleInfo } = require("./util");

/**
 * @param {Message} message
 * @param {{reason: string, action: string}} report
 * @param {{ping: RoleInfo?}} options
 */
function buildReportEmbed(message, report, options) {
  const embed = new EmbedBuilder()
    .setColor('Red')
    .setTitle('Comoderator flagged a message')
    .setURL(message.url)
    .setDescription('Please review the report and take action accordingly.')
    .setFooter({
      text: OLLAMA_CLOUD_API_KEY
        ? 'Comoderator is an AI and can make mistakes.'
        : 'Comoderator is an AI and can make mistakes. Comoderators LLM is locally hosted, no data leaves the server.'
    })
    .setAuthor({
      name: message.author.username,
      iconURL: message.author.avatarURL(),
    });

  embed.addFields([
    { name: ':e_mail: Offending message', value: '> ' + maxLength(sanitizeWhitespace(message.content), 500), },
    { name: ':page_facing_up: Comoderator report', value: '> ' + maxLength(sanitizeWhitespace(report.reason), 1000), },
    { name: ':information_source: Comoderator recommendation', value: '> Comoderator recommends the following action: ' + report.action },
  ]);

  return { embeds: [embed], content: options.ping ? `<@&${options.ping.id}>` : undefined, allowedMentions: { roles: options.ping ? [options.ping.id] : [] } };
}
module.exports.buildReportEmbed = buildReportEmbed;
