const { GuildMember, Message, Guild } = require("discord.js");
const { dbGetAll, dbGet } = require("./db");
const { default: ollama } = require('ollama');
const { buildReportEmbed } = require('./report');

/**
 * Checks and removes roles.
 * @param {GuildMember} oldMember The old member.
 * @param {GuildMember?} newMember The new member.
 * @returns {Promise<void>} Once done
 */
async function maybeUpdateRoles(oldMember, newMember) {
  const settings = dbGetAll("roles")
  for (const setting of settings) {
    if (setting.guildId !== newMember.guild.id) {
      continue;
    }

    // Still has the role
    if (newMember.roles.cache.has(setting.roleId)) {
      continue;
    }
    // The user never had the role
    if (!oldMember.roles.cache.has(setting.roleId)) {
      continue;
    }

    for (const removeSetting in setting.remove) {
      const role = newMember.roles.cache.get(removeSetting);
      if (!role) {
        continue;
      }

      console.log(`Will remove ${role.id} (${role.name}) from ${newMember.id} (${newMember.displayName})`)
      try {
        await newMember.roles.remove(role, "Auto remover: " + setting.roleName);
      } catch (error) {
        console.log(`Failed to remove ${role} from ${newMember}`, error);
      }
    }
  }
}

/**
 * Runs the LLM on the given message
 * @param {Message} message The message.
 * @returns {Promise<void>} Once done
 */
async function runLlm(message) {
  if (message.author.bot || message.author.system) {
    return;
  }

  const data = dbGet("prompts", message.guildId);
  if (data === null) {
    return;
  }

  const instructions = dbGetAll(["instructions", message.guildId]);
  const systemPrompt = replaceSystemPrompt(data.prompt, message.guild, instructions, data);
  const prompt = replaceTemplate(data.template, message, data);
  
  const response = await ollama.chat({
    model: data.model,
    think: false,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt },
    ],
  })
  
  let content = response.message.content;
  console.log(content)
  if (content.startsWith('```json')) {
    content = content.substring(8);
    content = content.substring(0, content.length - 4)
  }

  const json = JSON.parse(content);
  if (json.flagMessage) {
    const channelData = dbGet("channels", message.guildId);
    const reportChannel = await message.guild.channels.fetch(channelData.id);
    reportChannel.send(buildReportEmbed(message, json.reason, channelData));
  }
  //message.reply(`# Flag? \`${json.flagMessage}\`\n## Reason\n\`\`\`\n${json.reason}\`\`\``)
}

/**
 * @param {string} prompt 
 * @param {Guild} guild 
 */
function replaceSystemPrompt(prompt, guild, instructions, data) {
  return prompt
    .replaceAll('{instructions}', instructions.map(i => '- ' + i.text.replaceAll('\n', ' ')).join('\n'))
    .replaceAll('{guildName}', data.guildName)
    .replaceAll('{template}', data.template);
}
/**
 * @param {string} template 
 * @param {Message} message 
 */
function replaceTemplate(template, message, data) {
  const member = message.member;
  const guild = message.guild;
  const ignoreRolesRegex = new RegExp(data.ignoreRolesRegex);
  return template
    .replaceAll('{userName}', member.user.username)
    .replaceAll('{displayName}', member.displayName)
    .replaceAll('{accountAge}', member.user.createdAt.toLocaleDateString("en-US"))
    .replaceAll('{joinedAt}', member.joinedAt.toLocaleDateString("en-US"))
    .replaceAll('{now}', new Date().toLocaleDateString("en-US"))
    .replaceAll('{roles}', member.roles.cache.filter(r => !ignoreRolesRegex.test(r.name)).filter(r => r.name !== "@everyone").map(r => '"' + r.name + '"').join(", "))
    .replaceAll('{message}', message.content);
}

module.exports.runLlm = runLlm;