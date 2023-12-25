/* eslint-disable linebreak-style */
/* eslint-disable no-undef */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-vars */
/* eslint-disable no-underscore-dangle */
/* eslint-disable class-methods-use-this */
class ToggleLikeCommentUseCase {
  constructor({ commentRepository, threadRepository, commentLikeRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
    this._commentLikeRepository = commentLikeRepository;
  }

  async execute(userId, threadId, commentId) {
    await this._threadRepository.verifyThreadExist(threadId);
    await this._commentRepository.verifyCommentExist(commentId);

    const countLike = await this._commentLikeRepository.getCountLikeFromUser(userId, commentId);
    if (countLike < 1) {
      await this._commentLikeRepository.addLike(userId, commentId);
    } else {
      await this._commentLikeRepository.deleteLike(userId, commentId);
    }
  }
}

module.exports = ToggleLikeCommentUseCase;
