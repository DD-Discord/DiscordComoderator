const { dbSerialize } = require("./db");

const WHITESPACE_REGEX = /\s+/g;

/**
 * @param {string} value 
 */
function sanitizeWhitespace(value) {
  return value.replaceAll(WHITESPACE_REGEX, ' ');
}
module.exports.sanitizeWhitespace = sanitizeWhitespace;

/**
 * @param {string} value 
 * @param {number} maxLength 
 */
function maxLength(value, maxLength) {
  if (value.length > maxLength) {
    value = value.substring(0, maxLength);
    value += ' […]';
  }
  return value;
}
module.exports.maxLength = maxLength;

function wrapInCode(value, maxLengthValue = 1500) {
  if (typeof value !== 'string') {
    value = dbSerialize(value);
  }
  value = maxLength(value, maxLengthValue);
  return '```\n' + value + '\n```'
}
module.exports.wrapInCode = wrapInCode;