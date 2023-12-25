/* eslint-disable linebreak-style */
/* eslint-disable no-undef */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-vars */
/* eslint-disable no-underscore-dangle */
/* eslint-disable class-methods-use-this */
const AddThread = require('../../Domains/threads/entities/AddThread');

class AddThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(userId, useCasePayload) {
    // isi useCasePayload title and body
    const newThread = new AddThread(useCasePayload);

    return this._threadRepository.addThread(userId, newThread);
  }
}

module.exports = AddThreadUseCase;
