const { Role, Channel, Guild } = require("discord.js");

/**
 * Information about a single channel.
 * @typedef {Object} ChannelInfo
 * 
 * @property {string} id The ID of the channel.
 * @property {string} name The name of the channel.
 * @property {ChannelInfo | undefined} parent The parent of the channel, if any.
 */

/**
 * Information about a single role.
 * @typedef {Object} RoleInfo
 * 
 * @property {string} id The ID of the role.
 * @property {string} name The name of the role.
 */

/**
 * Information about a single guild.
 * @typedef {Object} GuildInfo
 * 
 * @property {string} id The ID of the guild.
 * @property {string} name The name of the guild.
 */

/**
 * 
 * @param {Channel} channel
 * @returns {ChannelInfo}
 */
function getChannelInfo(channel) {
  if (channel.isThread()) {
    return {
      id: channel.id,
      name: channel.name,
      parent: getChannelInfo(channel.parent),
    };
  }
  return {
    id: channel.id,
    name: channel.name,
  };
}
module.exports.getChannelInfo = getChannelInfo;

/**
 * 
 * @param {Role} role
 * @returns {RoleInfo}
 */
function getRoleInfo(role) {
  return {
    id: role.id,
    name: role.name,
  };
}
module.exports.getRoleInfo = getRoleInfo;

/**
 * 
 * @param {Guild} guild
 * @returns {GuildInfo}
 */
function getGuildInfo(guild) {
  return {
    id: guild.id,
    name: guild.name,
  };
}
module.exports.getGuildInfo = getGuildInfo;
