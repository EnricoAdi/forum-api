/* eslint-disable linebreak-style */
/* eslint-disable no-undef */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-vars */
/* eslint-disable no-underscore-dangle */
/* eslint-disable class-methods-use-this */
/* istanbul ignore file */
const Jwt = require('@hapi/jwt');
const pool = require('../src/Infrastructures/database/postgres/pool');
const UsersTableTestHelper = require('./UsersTableTestHelper');

const ServerTestHelper = {
  async getAccessToken() {
    const payloadUser = {
      id: 'user-123',
      username: 'dicoding',
      password: 'secret',
      fullname: 'Dicoding Indonesia',
    };
    const getUser = await UsersTableTestHelper.findUsersById('user-123');
    if (getUser.length === 0) {
      await UsersTableTestHelper.addUser(payloadUser);
    }
    return Jwt.token.generate(payloadUser, process.env.ACCESS_TOKEN_KEY);
  },
  async generateAccessToken(payloadUser) {
    return Jwt.token.generate(payloadUser, process.env.ACCESS_TOKEN_KEY);
  },
};
module.exports = ServerTestHelper;
