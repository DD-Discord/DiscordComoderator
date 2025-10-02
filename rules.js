const { Message } = require("discord.js");

/**
 * @param {Message} message
 */
function parseRulesFromMessage(message) {
  let rule = [];
  if (message.content) {
    rule.push(message.content);
  }
  for (const embed of message.embeds) {
    if (embed.title) {
      rule.push(embed.title);
    }
    if (embed.description) {
      rule.push(embed.description);
    }
    for (const field of embed.fields) {
      if (field.name) {
        rule.push(field.name);
      }
      if (field.value) {
        rule.push(field.value);
      }
    }
  }

  return rule.join('\n');
}
module.exports.parseRulesFromMessage = parseRulesFromMessage;