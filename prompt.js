const { Guild, Message } = require("discord.js");
const { dbGet, dbGetAll } = require("./db");

/**
 * @param {Guild} guild 
 */
function getSystemPrompt(guild) {
  const data = dbGet("prompts", guild.id);
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
  const data = dbGet("prompts", guild.id);
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
    .replaceAll('{instructions}', instructions.map(i => '- ' + i.text.replaceAll('\n', ' ')).join('\n'))
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
  const member = message.member;
  const guild = message.guild;
  const ignoreRolesRegex = new RegExp(opts.ignoreRolesRegex);
  return template
    .replaceAll('{userName}', member.user.username)
    .replaceAll('{displayName}', member.displayName)
    .replaceAll('{accountAge}', member.user.createdAt.toLocaleDateString("en-US"))
    .replaceAll('{joinedAt}', member.joinedAt.toLocaleDateString("en-US"))
    .replaceAll('{now}', new Date().toLocaleDateString("en-US"))
    .replaceAll('{guildId}', guild.id)
    .replaceAll('{guildName}', guild.name)
    .replaceAll('{roles}', member.roles.cache.filter(r => !ignoreRolesRegex.test(r.name)).filter(r => r.name !== "@everyone").map(r => '"' + r.name + '"').join(", "))
    .replaceAll('{channelName}', message.channel.name)
    .replaceAll('{message}', message.content);
}