

/**
 * Makes a random stirng to be used as an ID
 * @param stringLength The length of the string
 * @returns {string} An alpha-numeric string
 */
const makeID = (stringLength) => {
  let text = "";
  const possibleChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  // Builds the string
  for( let i=0; i < stringLength; i++ )
    text += possibleChars.charAt(Math.floor(Math.random() * possibleChars.length));

  return text;
};

module.exports = makeID;
