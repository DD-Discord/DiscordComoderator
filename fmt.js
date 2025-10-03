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

function wrapInCode(value, opts = null) {
  if (typeof value !== 'string') {
    value = dbSerialize(value);
  }
  value = maxLength(value, opts?.maxLength ?? 1500);
  if (value.contains('\n')) {
    return '```' + (opts?.language ?? '') + '\n' + value + '\n```';
  } else {
    return '`' + value + '`';
  }
}
module.exports.wrapInCode = wrapInCode;

const COLOR = {
  RESET: '\x1b[0m',
  DIM: "\x1b[2m",
  FG_MAGENTA: "\x1b[35m"
}
module.exports.COLOR = COLOR;
