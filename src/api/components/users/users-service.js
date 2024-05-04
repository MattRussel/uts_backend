const usersRepository = require('./users-repository');
const { hashPassword, passwordMatched } = require('../../../utils/password');

/**
 * Get list of users with pagination, search, and sorting
 * @param {number} page_number - Page number
 * @param {number} page_size - Number of users per page
 * @param {string} search - String to search
 * @param {string} sort - Sorting criteria (e.g., "email:desc")
 * @returns {Object}
 */
async function getUsers(page_number, page_size, search, sort) {
  const users = await usersRepository.getUsers();

  // Membuat filter untuk mencari user
  let filter = {};
  if (search) {
    const [columnName, searchValue] = search.split(':');
    if (columnName && searchValue) {
      filter = {
        [columnName]: { $regex: searchValue, $options: 'i' },
      };
    }
  }
  const filteredUsers = users.filter((user) => {
    for (const key in filter) {
      if (
        user[key].match(
          new RegExp(filter[key].$regex, filter[key].$options)
        ) === null
      ) {
        return false;
      }
    }
    return true;
  });

  // Membuat sorting ascending dan descending
  if (sort) {
    const [sortBy, sortOrder] = sort.split(':');
    filteredUsers.sort((a, b) => {
      if (sortOrder === 'desc') {
        return b[sortBy].localeCompare(a[sortBy]);
      } else if (sortOrder === 'asc') {
        return a[sortBy].localeCompare(b[sortBy]);
      } else {
        throw new Error('Invalid sort order');
      }
    });
  }

  // Menghitung halaman, jumlah data per halaman, mengecek apakah memiliki halaman sebelum atau sesudah
  const totalItems = filteredUsers.length;
  const total_pages = Math.ceil(totalItems / page_size);
  const start_index = (page_number - 1) * page_size;
  const end_index = Math.min(start_index + page_size, totalItems);
  const data = filteredUsers.slice(start_index, end_index);

  return {
    page_number,
    page_size,
    count: data.length,
    total_pages,
    has_previous_page: page_number > 1,
    has_next_page: end_index < totalItems,
    data: data.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
    })),
  };
}

/**
 * Get user detail
 * @param {string} id - User ID
 * @returns {Object}
 */
async function getUser(id) {
  const user = await usersRepository.getUser(id);

  // User not found
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}

/**
 * Create new user
 * @param {string} name - Name
 * @param {string} email - Email
 * @param {string} password - Password
 * @returns {boolean}
 */
async function createUser(name, email, password) {
  // Hash password
  const hashedPassword = await hashPassword(password);

  try {
    await usersRepository.createUser(name, email, hashedPassword);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Update existing user
 * @param {string} id - User ID
 * @param {string} name - Name
 * @param {string} email - Email
 * @returns {boolean}
 */
async function updateUser(id, name, email) {
  const user = await usersRepository.getUser(id);

  // User not found
  if (!user) {
    return null;
  }

  try {
    await usersRepository.updateUser(id, name, email);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Delete user
 * @param {string} id - User ID
 * @returns {boolean}
 */
async function deleteUser(id) {
  const user = await usersRepository.getUser(id);

  // User not found
  if (!user) {
    return null;
  }

  try {
    await usersRepository.deleteUser(id);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Check whether the email is registered
 * @param {string} email - Email
 * @returns {boolean}
 */
async function emailIsRegistered(email) {
  const user = await usersRepository.getUserByEmail(email);

  if (user) {
    return true;
  }

  return false;
}

/**
 * Check whether the password is correct
 * @param {string} userId - User ID
 * @param {string} password - Password
 * @returns {boolean}
 */
async function checkPassword(userId, password) {
  const user = await usersRepository.getUser(userId);
  return passwordMatched(password, user.password);
}

/**
 * Change user password
 * @param {string} userId - User ID
 * @param {string} password - Password
 * @returns {boolean}
 */
async function changePassword(userId, password) {
  const user = await usersRepository.getUser(userId);

  // Check if user not found
  if (!user) {
    return null;
  }

  const hashedPassword = await hashPassword(password);

  const changeSuccess = await usersRepository.changePassword(
    userId,
    hashedPassword
  );

  if (!changeSuccess) {
    return null;
  }

  return true;
}

// Fungsi create: Membuat akun bank
async function createEonlinebanking(name, email, password, balance) {
  // Hash password
  const hashedPassword = await hashPassword(password);
  const emailIsRegisteredInEonlinebankings =
    await usersRepository.emailIsRegisteredInEonlinebankings(email);

  if (emailIsRegisteredInEonlinebankings) {
    throw new Error('Email is already registered');
  }

  try {
    await usersRepository.createEonlinebanking(
      name,
      email,
      hashedPassword,
      balance
    );
  } catch (err) {
    return null;
  }

  return true;
}

// Fungsi Read: Cek saldo user
async function getUserBalance(email, password) {
  // Cari pengguna di database eonlinebanking berdasarkan email
  const user = await usersRepository.findUserByEmail(email);

  // Jika pengguna tidak ditemukan, lempar error
  if (!user) {
    throw new Error('Invalid email or password');
  }

  // Verifikasi kata sandi yang dimasukkan oleh pengguna dengan kata sandi yang di-hash di dalam database
  const isPasswordMatched = await passwordMatched(password, user.password);

  // Jika kata sandi tidak cocok, lempar error
  if (!isPasswordMatched) {
    throw new Error('Invalid email or password');
  }

  // Kembalikan saldo pengguna
  return user.balance;
}

// Fungsi Update: Menabung dan Penarikan
async function updateBalance(userId, email, password, amount) {
  // Verifikasi kredensial pengguna
  const user = await usersRepository.getUserEonlineBanking(userId);

  if (!user) {
    throw new Error('User not found');
  }

  // Periksa apakah kata sandi benar
  const isPasswordValid = await passwordMatched(password, user.password);

  if (!isPasswordValid) {
    throw new Error('Invalid password');
  }

  // Dapatkan saldo saat ini
  let balance = user.balance || 0;

  // Tambah atau kurangi jumlah
  balance += amount;

  // Perbarui saldo di database
  await usersRepository.updateBalance(userId, balance);

  return balance;
}

// Fungsi Delete: Tutup akun bank
async function deleteEonlinebanking(id, email, password) {
  // Cari pengguna berdasarkan ID
  const user = await usersRepository.getUserEonlineBanking(id);

  // Jika pengguna tidak ditemukan, lempar error
  if (!user) {
    throw new Error('User not found');
  }

  // Periksa apakah email sesuai dengan pengguna yang dimaksud
  if (user.email !== email) {
    throw new Error('Email does not match the user');
  }

  // Verifikasi kata sandi yang dimasukkan oleh pengguna dengan kata sandi yang di-hash di dalam database
  const isPasswordMatched = await passwordMatched(password, user.password);

  // Jika kata sandi tidak cocok, lempar error
  if (!isPasswordMatched) {
    throw new Error('Invalid password');
  }

  // Hapus akun pengguna
  await usersRepository.deleteEonlinebanking(id);

  return true;
}

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  emailIsRegistered,
  checkPassword,
  changePassword,
  createEonlinebanking,
  getUserBalance,
  updateBalance,
  deleteEonlinebanking,
};
