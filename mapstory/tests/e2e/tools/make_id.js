/**
 * Makes a random stirng to be used as an ID
 * @param length The length of the string
 * @returns {string} An alpha-numeric string
 */
const MakeID = (length) => {
  let text = "";
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";


  // Sets the default length
  if( length === null){ length = 7; }

  // Builds the string
  for( let i=0; i < length; i++ )
    text += chars.charAt(Math.floor(Math.random() * chars.length));

  return text;
};

module.exports = MakeID;
