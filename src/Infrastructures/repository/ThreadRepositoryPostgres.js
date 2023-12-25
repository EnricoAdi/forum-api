/* eslint-disable linebreak-style */
/* eslint-disable no-underscore-dangle */
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AddedThread = require('../../Domains/threads/entities/AddedThread');
const GetThread = require('../../Domains/threads/entities/GetThread');
const ThreadRepository = require('../../Domains/threads/ThreadRepository');

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addThread(userId, registerThread) {
    const { title, body } = registerThread;
    const id = `thread-${this._idGenerator()}`;
    const owner = userId;
    const query = {
      text: 'INSERT INTO threads VALUES($1, $2, $3, $4) RETURNING id, title, owner',
      values: [id, title, body, owner],
    };

    const result = await this._pool.query(query);
    return new AddedThread({ ...result.rows[0] });
  }

  async verifyThreadExist(threadId) {
    const query = {
      text: 'SELECT owner FROM threads WHERE id = $1',
      values: [threadId],
    };
    const result = await this._pool.query(query);
    const thread = result.rows[0];
    if (!thread) {
      throw new NotFoundError('THREAD_REPOSITORY.NOT_FOUND');
    }
  }

  async verifyThreadAccess(userId, threadId) {
    const query = {
      text: 'SELECT owner FROM threads WHERE id = $1',
      values: [threadId],
    };
    const result = await this._pool.query(query);
    const thread = result.rows[0];
    if (thread.owner !== userId) {
      throw new AuthorizationError('THREAD_REPOSITORY.CANNOT_ACCESS');
    }
  }

  async getThread(threadId) {
    const queryThread = {
      text: 'SELECT threads.id, threads.title, threads.body, users.username, threads.created_at as date FROM threads INNER JOIN users ON threads.owner = users.id WHERE threads.id = $1',
      values: [threadId],
    };
    const resultThread = await this._pool.query(queryThread);
    return new GetThread({ ...resultThread.rows[0] });
  }
}

module.exports = ThreadRepositoryPostgres;
