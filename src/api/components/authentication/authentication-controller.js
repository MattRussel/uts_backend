const { errorResponder, errorTypes } = require('../../../core/errors');
const authenticationServices = require('./authentication-service');

/**
 * Handle login request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function login(request, response, next) {
  const { email, password } = request.body;

  try {
    // Mengambil jumlah gagal login attempts
    const loginAttempts =
      await authenticationServices.getFailedLoginAttempts(email);
    if (loginAttempts >= 5) {
      throw errorResponder(
        errorTypes.FORBIDDEN,
        'Too many failed login attempts. Try again later.'
      );
    }

    // Check login credentials
    const loginSuccess = await authenticationServices.checkLoginCredentials(
      email,
      password
    );

    if (!loginSuccess) {
      throw errorResponder(
        errorTypes.INVALID_CREDENTIALS,
        'Wrong email or password'
      );
    }

    return response.status(200).json(loginSuccess);
  } catch (error) {
    // Jika sudah lebih dari 5 gagal
    if (error.code === 'FORBIDDEN') {
      return response.status(403).json({
        statusCode: 403,
        error: errorTypes.FORBIDDEN,
        description: 'Too many failed login attempts',
        message: error.message,
      });
    }
    return next(error);
  }
}

module.exports = {
  login,
};
