const usersService = require('./users-service');
const { errorResponder, errorTypes } = require('../../../core/errors');

/**
 * Handle get list of users request with search capability
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function getUsers(request, response, next) {
  try {
    // Mengambil value dari bruno
    let { page_number, page_size, search, sort } = request.query;

    page_number = parseInt(page_number);
    page_size = parseInt(page_size);
    sort = sort || '';

    const users = await usersService.getUsers(
      page_number,
      page_size,
      search,
      sort
    );
    return response.status(200).json(users);
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle get user detail request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function getUser(request, response, next) {
  try {
    const user = await usersService.getUser(request.params.id);

    if (!user) {
      throw errorResponder(errorTypes.UNPROCESSABLE_ENTITY, 'Unknown user');
    }

    return response.status(200).json(user);
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle create user request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function createUser(request, response, next) {
  try {
    const name = request.body.name;
    const email = request.body.email;
    const password = request.body.password;
    const password_confirm = request.body.password_confirm;

    // Check confirmation password
    if (password !== password_confirm) {
      throw errorResponder(
        errorTypes.INVALID_PASSWORD,
        'Password confirmation mismatched'
      );
    }

    // Email must be unique
    const emailIsRegistered = await usersService.emailIsRegistered(email);
    if (emailIsRegistered) {
      throw errorResponder(
        errorTypes.EMAIL_ALREADY_TAKEN,
        'Email is already registered'
      );
    }

    const success = await usersService.createUser(name, email, password);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to create user'
      );
    }

    return response.status(200).json({ name, email });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle update user request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function updateUser(request, response, next) {
  try {
    const id = request.params.id;
    const name = request.body.name;
    const email = request.body.email;

    // Email must be unique
    const emailIsRegistered = await usersService.emailIsRegistered(email);
    if (emailIsRegistered) {
      throw errorResponder(
        errorTypes.EMAIL_ALREADY_TAKEN,
        'Email is already registered'
      );
    }

    const success = await usersService.updateUser(id, name, email);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to update user'
      );
    }

    return response.status(200).json({ id });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle delete user request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function deleteUser(request, response, next) {
  try {
    const id = request.params.id;

    const success = await usersService.deleteUser(id);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to delete user'
      );
    }

    return response.status(200).json({ id });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle change user password request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function changePassword(request, response, next) {
  try {
    // Check password confirmation
    if (request.body.password_new !== request.body.password_confirm) {
      throw errorResponder(
        errorTypes.INVALID_PASSWORD,
        'Password confirmation mismatched'
      );
    }

    // Check old password
    if (
      !(await usersService.checkPassword(
        request.params.id,
        request.body.password_old
      ))
    ) {
      throw errorResponder(errorTypes.INVALID_CREDENTIALS, 'Wrong password');
    }

    const changeSuccess = await usersService.changePassword(
      request.params.id,
      request.body.password_new
    );

    if (!changeSuccess) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to change password'
      );
    }

    return response.status(200).json({ id: request.params.id });
  } catch (error) {
    return next(error);
  }
}


// Fungsi create: Membuat akun bank
async function createEonlinebanking(request, response, next) {
  try {
    const name = request.body.name;
    const email = request.body.email;
    const password = request.body.password;
    const password_confirm = request.body.password_confirm;
    const balance = request.body.balance;

    // Check confirmation password
    if (password !== password_confirm) {
      throw errorResponder(
        errorTypes.INVALID_PASSWORD,
        'Password confirmation mismatched'
      );
    }

    // Email must be unique
    const emailIsRegistered = await usersService.emailIsRegistered(email);
    if (emailIsRegistered) {
      throw errorResponder(
        errorTypes.EMAIL_ALREADY_TAKEN,
        'Email is already registered'
      );
    }

    // Memasukkan balance ke dalam pemanggilan fungsi createEonlinebanking
    const success = await usersService.createEonlinebanking(name, email, password, balance);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to create Eonlinebanking'
      );
    }

  return response.status(200).json({ message: "Selamat akun anda berhasil dibuat", name, email, balance });
  } catch (error) {
    return next(error);
  }
}

// Fungsi Read: Cek saldo user
async function getUserBalance(request, response, next) {
  try {
    const { email, password } = request.body;

    // Panggil service untuk mendapatkan saldo pengguna
    const balance = await usersService.getUserBalance(email, password);

    // Kembalikan saldo sebagai respons
    return response.status(200).json({ balance });
  } catch (error) {
    return next(error);
  }
}

// Fungsi Update: Menabung dan Penarikan
async function updateBalance(request, response, next) {
  try {
    const userId = request.params.id;
    const { email, password, amount } = request.body;

    // Panggil fungsi layanan untuk memperbarui saldo
    const updatedBalance = await usersService.updateBalance(userId, email, password, amount);

    // Kembalikan saldo yang diperbarui sebagai respons
    return response.status(200).json({ balance: updatedBalance });
  } catch (error) {
    return next(error);
  }
}

// Fungsi Delete: Tutup akun bank
async function deleteEonlinebanking(request, response, next) {
  try {
    const id = request.params.id;
    const { email, password } = request.body;

    const success = await usersService.deleteEonlinebanking(id, email, password);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to delete Eonlinebanking account'
      );
    }

    return response.status(200).json({ message: 'Akun anda berhasil ditutup' });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  changePassword,
  createEonlinebanking,
  getUserBalance,
  updateBalance,
  deleteEonlinebanking,
};
