/* eslint-disable linebreak-style */
/* eslint-disable no-underscore-dangle */
/* eslint-disable class-methods-use-this */
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AddedReply = require('../../Domains/replies/entities/AddedReply');
const ReplyRepository = require('../../Domains/replies/ReplyRepository');

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addReply(userId, commentId, registerReply) {
    const { content } = registerReply;
    const id = `reply-${this._idGenerator()}`;
    const owner = userId;
    const query = {
      text: 'INSERT INTO replies(id, content, comment_id, owner, is_delete) VALUES($1, $2, $3, $4, $5) RETURNING id, content, owner',
      values: [id, content, commentId, owner, false],
    };

    const result = await this._pool.query(query);
    return new AddedReply({ ...result.rows[0] });
  }

  async deleteReply(replyId) {
    // soft delete
    const query = {
      text: 'UPDATE replies set is_delete = TRUE WHERE id = $1',
      values: [replyId],
    };
    await this._pool.query(query);
  }

  async verifyReplyExist(replyId) {
    const query = {
      text: 'SELECT comment_id FROM replies WHERE id = $1',
      values: [replyId],
    };
    const result = await this._pool.query(query);
    const thread = result.rows[0];
    if (!thread) {
      throw new NotFoundError('REPLY_REPOSITORY.NOT_FOUND');
    }
  }

  async verifyReplyAccess(userId, replyId) {
    const query = {
      text: 'SELECT owner FROM replies WHERE id = $1',
      values: [replyId],
    };
    const result = await this._pool.query(query);
    const reply = result.rows[0];
    if (reply.owner !== userId) {
      throw new AuthorizationError('REPLY_REPOSITORY.CANNOT_ACCESS');
    }
  }

  async fetchReplyByCommentId(commentId) {
    const queryReply = {
      text: `SELECT replies.id, replies.created_at as date, users.username, 
        replies.content, replies.is_delete 
        FROM replies INNER JOIN users ON replies.owner = users.id 
        WHERE replies.comment_id = $1 ORDER BY replies.created_at ASC`,
      values: [commentId],
    };
    const resultReply = await this._pool.query(queryReply);
    return resultReply.rows;
  }
}

module.exports = ReplyRepositoryPostgres;
