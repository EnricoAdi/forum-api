/* eslint-disable linebreak-style */
/* istanbul ignore file */
/* eslint-disable no-undef */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-vars */
/* eslint-disable no-underscore-dangle */
/* eslint-disable class-methods-use-this */
const pool = require('../src/Infrastructures/database/postgres/pool');

const CommentsTableTestHelper = {
  async addComment({
    id = 'comment-123', content = 'dicoding comment', thread_id = 'thread-123', owner = 'user-123', is_delete = false,
  }) {
    const query = {
      text: 'INSERT INTO comments(id, content, thread_id, owner, is_delete) VALUES($1, $2, $3, $4, $5)',
      // eslint-disable-next-line camelcase
      values: [id, content, thread_id, owner, is_delete],
    };

    await pool.query(query);
  },

  async findCommentsById(id) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async findCommentsByThreadId(threadId) {
    const query = {
      text: `SELECT comments.id, comments.created_at as date, users.username, 
      comments.content, comments.is_delete FROM comments INNER JOIN users ON comments.owner = users.id 
      WHERE comments.thread_id = $1 ORDER BY comments.created_at ASC`,
      values: [threadId],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM comments WHERE 1=1');
  },
};

module.exports = CommentsTableTestHelper;
