const { User } = require('../../../models');
const { Eonlinebanking } = require('../../../models');

/**
 * Get a list of users
 * @returns {Promise}
 */
async function getUsers() {
  return User.find({});
}

/**
 * Get user detail
 * @param {string} id - User ID
 * @returns {Promise}
 */
async function getUser(id) {
  return User.findById(id);
}

/**
 * Create new user
 * @param {string} name - Name
 * @param {string} email - Email
 * @param {string} password - Hashed password
 * @returns {Promise}
 */
async function createUser(name, email, password) {
  return User.create({
    name,
    email,
    password,
  });
}

/**
 * Update existing user
 * @param {string} id - User ID
 * @param {string} name - Name
 * @param {string} email - Email
 * @returns {Promise}
 */
async function updateUser(id, name, email) {
  return User.updateOne(
    {
      _id: id,
    },
    {
      $set: {
        name,
        email,
      },
    }
  );
}

/**
 * Delete a user
 * @param {string} id - User ID
 * @returns {Promise}
 */
async function deleteUser(id) {
  return User.deleteOne({ _id: id });
}

/**
 * Get user by email to prevent duplicate email
 * @param {string} email - Email
 * @returns {Promise}
 */
async function getUserByEmail(email) {
  return User.findOne({ email });
}

/**
 * Update user password
 * @param {string} id - User ID
 * @param {string} password - New hashed password
 * @returns {Promise}
 */
async function changePassword(id, password) {
  return User.updateOne({ _id: id }, { $set: { password } });
}

async function emailIsRegisteredInEonlinebankings(email) {
  const eonlinebanking = await Eonlinebanking.findOne({ email });
  return !!eonlinebanking; // Mengembalikan true jika email sudah terdaftar dalam koleksi eonlinebankings
}

// Fungsi Create: memasukkan akun user kedalam database baru
async function createEonlinebanking(name, email, password, balance) {
  return Eonlinebanking.create({
    name,
    email,
    password,
    balance,
  });
}

// Mencari user di database baru
async function findUserByEmail(email) {
  return Eonlinebanking.findOne({ email });
}

// Mencari user di database baru
async function getUserEonlineBanking(id) {
  return Eonlinebanking.findById(id);
}

// Fungsi Update: mengganti data user di database baru
async function updateBalance(userId, balance) {
  return Eonlinebanking.updateOne({ _id: userId }, { $set: { balance } });
}

// Fungsi Delete: Menghapus akun user dari database
async function deleteEonlinebanking(id) {
  return Eonlinebanking.deleteOne({ _id: id });
}

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getUserByEmail,
  changePassword,
  createEonlinebanking,
  emailIsRegisteredInEonlinebankings,
  findUserByEmail,
  getUserEonlineBanking,
  updateBalance,
  deleteEonlinebanking,
};
