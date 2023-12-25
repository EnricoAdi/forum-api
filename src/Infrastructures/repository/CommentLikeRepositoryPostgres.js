/* eslint-disable linebreak-style */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-vars */
/* eslint-disable no-underscore-dangle */
/* eslint-disable class-methods-use-this */
const CommentLikeRepository = require('../../Domains/commentLikes/CommentLikeRepository');

class CommentLikeRepositoryPostgres extends CommentLikeRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async getCountLikeFromUser(userId, commentId) {
    const query = {
      text: 'SELECT count(*) as likecount FROM comment_likes WHERE owner = $1 AND comment_id = $2',
      values: [userId, commentId],
    };
    const result = await this._pool.query(query);
    const { likecount } = result.rows[0];
    return likecount;
  }

  async addLike(userId, commentId) {
    const id = `commentLike-${this._idGenerator()}`;
    const query = {
      text: 'INSERT INTO comment_likes(id, comment_id, owner) VALUES($1, $2, $3) RETURNING id',
      values: [id, commentId, userId],
    };

    await this._pool.query(query);
  }

  async deleteLike(userId, commentId) {
    const query = {
      text: 'DELETE FROM comment_likes WHERE comment_id = $1 AND owner = $2',
      values: [commentId, userId],
    };
    await this._pool.query(query);
  }

  async countLike(commentId) {
    const query = {
      text: 'SELECT count(*) as likecount FROM comment_likes WHERE comment_id = $1',
      values: [commentId],
    };
    const result = await this._pool.query(query);
    const { likecount } = result.rows[0];
    return likecount;
  }
}
module.exports = CommentLikeRepositoryPostgres;
