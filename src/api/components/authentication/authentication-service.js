const authenticationRepository = require('./authentication-repository');
const { generateToken } = require('../../../utils/session-token');
const { passwordMatched } = require('../../../utils/password');

const failedLoginAttempts = {};

// Waktu untuk mereset login attempt (30 minutes in milliseconds)
const loginAttemptResetTime = 30 * 60 * 1000;

/**
 * Get the number of failed login attempts for the given email.
 * @param {string} email - Email address
 * @returns {number} Number of failed login attempts
 */
async function getFailedLoginAttempts(email) {
  // Check if there are failed login attempts for the email
  if (failedLoginAttempts[email]) {
    const { attempts, lastAttemptTime } = failedLoginAttempts[email];
    // Jika terakhir login 30 menit yang lalu, reset login attempt
    if (Date.now() - lastAttemptTime >= loginAttemptResetTime) {
      delete failedLoginAttempts[email];
      return 0;
    }
    return attempts;
  }
  return 0;
}

/**
 * Check username and password for login.
 * @param {string} email - Email
 * @param {string} password - Password
 * @returns {object} An object containing, among others, the JWT token if the email and password are matched. Otherwise returns null.
 */
async function checkLoginCredentials(email, password) {
  // Mengambil jumlah gagal login
  const attempts = await getFailedLoginAttempts(email);

  // Jika lebih dari 5 maka akan error
  if (attempts >= 5) {
    throw new Error('403 Forbidden: Too many failed login attempts');
  }

  const user = await authenticationRepository.getUserByEmail(email);

  // We define default user password here as '<RANDOM_PASSWORD_FILTER>'
  // to handle the case when the user login is invalid. We still want to
  // check the password anyway, so that it prevents the attacker in
  // guessing login credentials by looking at the processing time.
  const userPassword = user ? user.password : '<RANDOM_PASSWORD_FILLER>';
  const passwordChecked = await passwordMatched(password, userPassword);

  // Because we always check the password (see above comment), we define the
  // login attempt as successful when the `user` is found (by email) and
  // the password matches.
  if (user && passwordChecked) {
    // Jika berhasil login sebelum 5 kali gagal, akan menghapus total gagal login
    delete failedLoginAttempts[email];
    return {
      email: user.email,
      name: user.name,
      user_id: user.id,
      token: generateToken(user.email, user.id),
      loginAttempts: attempts,
    };
  } else {
    // Jika gagal, menambahkan jumlah gagal dan waktu terakhir login
    failedLoginAttempts[email] = {
      attempts: attempts + 1,
      lastAttemptTime: Date.now(),
    };
  }

  return null;
}

module.exports = {
  checkLoginCredentials,
  getFailedLoginAttempts,
};
