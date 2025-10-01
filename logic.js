const { GuildMember, Message, ModalSubmitInteraction, Guild } = require("discord.js");
const { dbGetAll, dbGet, dbWrite, dbSerialize } = require("./db");

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
 * Handles a modal submit
 * @param {ModalSubmitInteraction} interaction The interaction.
 */
function handleModalSubmit(interaction) {
  if (interaction.customId === 'systemPrompt') {
    console.log(interaction.fields)
    const data = dbGet("prompts", interaction.guildId);
    data.guildName = interaction.guild.name;
    data.prompt = interaction.fields.getTextInputValue('prompt');
    data.template = interaction.fields.getTextInputValue('template');
    dbWrite('prompts', interaction.guildId, data);
    interaction.reply({
      content: '# LLM prompts updated\n\n## System prompt\n```\n' + data.prompt.substring(0, 1000) + '\n```\n## Moderation request prompt\n```\n' + data.template.substring(0, 1000) + '\n```'
    })
  }
}
module.exports.handleModalSubmit = handleModalSubmit;

/**
 * Runs the LLM on the given message
 * @param {Message} message The message.
 * @returns {Promise<void>} Once done
 */
async function runLlm(message) {
  const data = dbGet("prompts", message.guildId);
  if (data === null) {
    return;
  }

  const prompt = replaceTemplate(data.template, message, data);
  console.log(prompt)
}

/**
 * @param {string} prompt 
 * @param {Guild} guild 
 */
function replaceSystemPrompt(prompt, guild, data) {
  return prompt
    .replaceAll('{instructions}', '- Please flag ALL messages as spam from members without the "lvl 5" role.\n- If they have the "lvl 5" role, NEVER flag it as spam.')
    .replaceAll('{guildName}', data.guildName)
    .replaceAll('{template}', date.template);
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
    .replaceAll('{roles}', member.roles.cache.filter(r => !ignoreRolesRegex.test(r.name)).map(r => '"' + r.name + '"').join(", "))
    .replaceAll('{message}', message.content);
}

module.exports.runLlm = runLlm;