/* eslint-disable linebreak-style */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-vars */
/* eslint-disable no-underscore-dangle */
/* eslint-disable class-methods-use-this */
const AddedComment = require('../../Domains/comments/entities/AddedComment');
const CommentRepository = require('../../Domains/comments/CommentRepository');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment(userId, threadId, registerComment) {
    const { content } = registerComment;
    const id = `comment-${this._idGenerator()}`;
    const owner = userId;
    const query = {
      text: 'INSERT INTO comments(id, content, thread_id, owner, is_delete) VALUES($1, $2, $3, $4, $5) RETURNING id, content, owner',
      values: [id, content, threadId, owner, false],
    };

    const result = await this._pool.query(query);
    return new AddedComment({ ...result.rows[0] });
  }

  async deleteComment(commentId) {
    // soft delete
    const query = {
      text: 'UPDATE comments set is_delete = TRUE WHERE id = $1',
      values: [commentId],
    };
    await this._pool.query(query);
  }

  async verifyCommentExist(commentId) {
    const query = {
      text: 'SELECT thread_id FROM comments WHERE id = $1',
      values: [commentId],
    };
    const result = await this._pool.query(query);
    const thread = result.rows[0];
    if (!thread) {
      throw new NotFoundError('COMMENT_REPOSITORY.NOT_FOUND');
    }
  }

  async verifyCommentAccess(userId, commentId) {
    const query = {
      text: 'SELECT owner FROM comments WHERE id = $1',
      values: [commentId],
    };
    const result = await this._pool.query(query);
    const thread = result.rows[0];
    if (thread.owner !== userId) {
      throw new AuthorizationError('COMMENT_REPOSITORY.CANNOT_ACCESS');
    }
  }

  async fetchCommentByThreadId(threadId) {
    const queryComment = {
      text: `SELECT comments.id, comments.created_at as date, users.username, 
      comments.content, comments.is_delete FROM comments INNER JOIN users ON comments.owner = users.id 
      WHERE comments.thread_id = $1 ORDER BY comments.created_at ASC`,
      values: [threadId],
    };
    const resultComment = await this._pool.query(queryComment);
    return resultComment.rows;
  }
}

module.exports = CommentRepositoryPostgres;
