const { Guild, Message } = require("discord.js");
const { dbGet, dbGetAll } = require("./db");
const { sanitizeWhitespace } = require("./fmt");

/**
 * @param {Guild} guild 
 */
function getSystemPrompt(guild) {
  const data = dbGet("guilds", guild.id);
  if (data === null) {
    return null;
  }
  const rules = dbGet('rules', guild.id);
  const instructions = dbGetAll(["instructions", guild.id]);
  const systemPrompt = replaceSystemPrompt(data.prompt, guild, instructions, rules?.rules, data.template);
  return systemPrompt;
}
module.exports.getSystemPrompt = getSystemPrompt;

/**
 * @param {Message} message 
 */
function getModerationPrompt(message) {
  const guild = message.guild;
  const data = dbGet("guilds", guild.id);
  if (data === null) {
    return null;
  }
  const prompt = replaceModerationPrompt(data.template, message, data);
  return prompt;
}
module.exports.getModerationPrompt = getModerationPrompt;

/**
 * @param {string} prompt The system prompt template.
 * @param {Guild} guild The discord guild.
 * @param {Array<{text: string}>} instructions The moderation instructions.
 * @param {string?} rules The rules of the server, if any.
 * @param {template} template The message moderation template. 
 */
function replaceSystemPrompt(prompt, guild, instructions, rules, template) {
  return prompt
    .replaceAll('{instructions}', instructions.map(i => '- ' + sanitizeWhitespace(i.text)).join('\n'))
    .replaceAll('{guildId}', guild.id)
    .replaceAll('{guildName}', guild.name)
    .replaceAll('{approximateMemberCount}', guild.approximateMemberCount)
    .replaceAll('{template}', template)
    .replaceAll('{rules}', rules ?? 'No rules have been defined for this server.');
}

/**
 * @param {string} template The moderation prompt template
 * @param {Message} message The message to moderate
 * @param {{ignoreRolesRegex: string}} opts Options for the prompt
 */
function replaceModerationPrompt(template, message, opts) {
  const author = message.author;
  const member = message.member;
  const guild = message.guild;
  const ignoreRolesRegex = new RegExp(opts.ignoreRolesRegex);
  return template
    .replaceAll('{userName}', author.username)
    .replaceAll('{displayName}', member?.displayName ?? author.displayName)
    .replaceAll('{accountAge}', author.createdAt.toLocaleDateString("en-US"))
    .replaceAll('{joinedAt}', member?.joinedAt.toLocaleDateString("en-US") ?? 'Not available')
    .replaceAll('{now}', new Date().toLocaleDateString("en-US"))
    .replaceAll('{guildId}', guild?.id ?? 'Not available')
    .replaceAll('{guildName}', guild?.name ?? 'Not available')
    .replaceAll('{roles}', member?.roles.cache.filter(r => !ignoreRolesRegex.test(r.name)).filter(r => r.name !== "@everyone").map(r => '"' + r.name + '"').join(", ") ?? 'Not available')
    .replaceAll('{channelName}', message.channel.name)
    .replaceAll('{message}', message.content);
}