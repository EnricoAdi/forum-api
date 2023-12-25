/* eslint-disable linebreak-style */
/* eslint-disable camelcase */
/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const CommentLikeTableTestHelper = {
  async addLike({
    id = 'commentLike-123', comment_id = 'comment-123', owner = 'user-123',
  }) {
    const query = {
      text: 'INSERT INTO comment_likes(id, comment_id, owner) VALUES($1, $2, $3)',
      values: [id, comment_id, owner],
    };

    await pool.query(query);
  },

  async findLikeById(id) {
    const query = {
      text: 'SELECT * FROM comment_likes WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async findLikeByCommentId(commentId) {
    const query = {
      text: 'SELECT * FROM comment_likes WHERE comment_id = $1',
      values: [commentId],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async getCountLikeFromUser(userId, commentId) {
    const query = {
      text: 'SELECT count(*) as likecount FROM comment_likes WHERE owner = $1 AND comment_id = $2',
      values: [userId, commentId],
    };
    const result = await pool.query(query);
    const { likecount } = result.rows[0];
    return likecount;
  },

  async cleanTable() {
    await pool.query('DELETE FROM comment_likes WHERE 1=1');
  },
};
module.exports = CommentLikeTableTestHelper;
