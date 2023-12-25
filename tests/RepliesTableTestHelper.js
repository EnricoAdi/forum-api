/* eslint-disable linebreak-style */
/* eslint-disable no-undef */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-vars */
/* eslint-disable no-underscore-dangle */
/* eslint-disable class-methods-use-this */
/* istanbul ignore file */

const pool = require('../src/Infrastructures/database/postgres/pool');

const RepliesTableTestHelper = {
  async addReply({
    id = 'reply-123', content = 'dicoding replie', comment_id = 'comment-123', owner = 'user-123', is_delete = false,
  }) {
    const query = {
      text: 'INSERT INTO replies(id, content, comment_id, owner, is_delete) VALUES($1, $2, $3, $4, $5)',
      // eslint-disable-next-line camelcase
      values: [id, content, comment_id, owner, is_delete],
    };

    await pool.query(query);
  },

  async findRepliesById(id) {
    const query = {
      text: 'SELECT * FROM replies WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async findRepliesByCommentId(commentId) {
    const queryReply = {
      text: `SELECT replies.id, replies.created_at as date, users.username, 
        replies.content, replies.is_delete 
        FROM replies INNER JOIN users ON replies.owner = users.id 
        WHERE replies.comment_id = $1 ORDER BY replies.created_at ASC`,
      values: [commentId],
    };
    const resultReply = await pool.query(queryReply);
    return resultReply.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM replies WHERE 1=1');
  },
};

module.exports = RepliesTableTestHelper;
