/**
 * Creates a household user.
 *
 * @param {string} name User name
 * @param {string} email User email
 * @returns {Object} User information
 */
function createUser(name, email) {
  return {
    name,
    email,
  };
}

module.exports = createUser;
