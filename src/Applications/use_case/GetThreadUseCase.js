/* eslint-disable linebreak-style */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-unused-vars */
/* eslint-disable no-underscore-dangle */
class GetThreadUseCase {
  constructor({
    threadRepository, commentRepository, replyRepository, commentLikeRepository,
  }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
    this._commentLikeRepository = commentLikeRepository;
  }

  async execute(threadId) {
    await this._threadRepository.verifyThreadExist(threadId);

    const thread = await this._threadRepository.getThread(threadId);

    const getComments = await this._commentRepository.fetchCommentByThreadId(threadId);
    const comments = [];

    for (let i = 0; i < getComments.length; i += 1) {
      const comment = getComments[i];
      let commentContent = comment.content;
      const likeCount = await this._commentLikeRepository.countLike(comment.id);
      if (comment.is_delete === true) {
        commentContent = '**komentar telah dihapus**';
      }
      const getReplies = await this._replyRepository.fetchReplyByCommentId(comment.id);
      const replies = [];
      for (let j = 0; j < getReplies.length; j += 1) {
        const reply = getReplies[j];
        let replyContent = reply.content;
        if (reply.is_delete === true) {
          replyContent = '**balasan telah dihapus**';
        }
        replies.push({
          id: reply.id,
          username: reply.username,
          date: reply.date,
          content: replyContent,
        });
      }
      comments.push({
        id: comment.id,
        username: comment.username,
        date: comment.date,
        content: commentContent,
        replies,
        likeCount,
      });
    }
    thread.comments = comments;
    return thread;
  }
}

module.exports = GetThreadUseCase;
