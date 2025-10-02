const { GuildMember, Message } = require("discord.js");
const { dbGetAll, dbGet } = require("./db");
const { default: ollama } = require('ollama');
const { buildReportEmbed } = require('./report');
const { getSystemPrompt, getModerationPrompt } = require("./prompt");

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

const COLOR = {
  RESET: '\x1b[0m',
  DIM: "\x1b[2m",
  FG_MAGENTA: "\x1b[35m"
}

const WHITESPACE_REGEX = /\s+/g;

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
  const systemPrompt = getSystemPrompt(message.guild);
  const moderationPrompt = getModerationPrompt(message);
  if (!systemPrompt || !moderationPrompt || !data) {
    return;
  }

  const response = await ollama.chat({
    model: data.model,
    think: false,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: moderationPrompt },
    ],
  })
  
  let content = response.message.content;
  console.log(`${COLOR.FG_MAGENTA}${message.author.username}${COLOR.RESET} ${COLOR.DIM}(${message.channel.name} in ${message.guild.name})${COLOR.RESET}: ${message.content.replaceAll('\n', ' ')}\n${content.replaceAll(WHITESPACE_REGEX, ' ')}`);
  // Some models wrap code in Markdown tags
  if (content.startsWith('```json')) {
    content = content.substring(8);
    content = content.substring(0, content.length - 4)
  }

  const json = JSON.parse(content);
  if (json.flag) {
    const channelData = dbGet("channels", message.guildId);
    if (channelData) {
      const reportChannel = await message.guild.channels.fetch(channelData.id);
      reportChannel.send(buildReportEmbed(message, json, channelData));
    }
  }
}


module.exports.runLlm = runLlm;