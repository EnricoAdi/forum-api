/* eslint-disable linebreak-style */
/* eslint-disable no-undef */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-vars */
/* eslint-disable no-underscore-dangle */
/* eslint-disable class-methods-use-this */
const AddComment = require('../../Domains/comments/entities/AddComment');

class AddCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(userId, threadId, useCasePayload) {
    // isi useCasePayload content
    const newComment = new AddComment(useCasePayload);
    await this._threadRepository.verifyThreadExist(threadId);

    return this._commentRepository.addComment(userId, threadId, newComment);
  }
}

module.exports = AddCommentUseCase;
