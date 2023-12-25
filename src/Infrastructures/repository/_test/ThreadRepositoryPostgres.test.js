/* eslint-disable linebreak-style */
/* eslint-disable no-undef */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-vars */
/* eslint-disable no-underscore-dangle */
/* eslint-disable class-methods-use-this */
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AddThread = require('../../../Domains/threads/entities/AddThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const GetThread = require('../../../Domains/threads/entities/GetThread');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');

describe('ThreadRepositoryPostgres', () => {
  const userId = 'user-123';
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addThread function', () => {
    it('should persist add thread and return added thread correctly', async () => {
      // Arrange
      const addThread = new AddThread({
        title: 'dicoding thread',
        body: 'dicoding body thread',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await threadRepositoryPostgres.addThread(userId, addThread);

      // Assert
      const threads = await ThreadsTableTestHelper.findThreadsById('thread-123');
      expect(threads).toHaveLength(1);
    });

    it('should return added thread correctly', async () => {
      // Arrange
      const addThread = new AddThread({
        title: 'dicoding thread',
        body: 'dicoding body thread',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedThread = await threadRepositoryPostgres.addThread(userId, addThread);

      // Assert
      expect(addedThread).toStrictEqual(new AddedThread({
        id: 'thread-123',
        title: 'dicoding thread',
        owner: 'user-123',
      }));
    });
  });

  describe('verifyThreadExist function', () => {
    it('should throw NotFoundError when thread not available', async () => {
      // Arrange
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'dicoding thread',
        body: 'dicoding body thread',
        owner: 'user-123',
      });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadRepositoryPostgres.verifyThreadExist('thread-124')).rejects.toThrowError(NotFoundError);
    });

    it('should not throw NotFoundError when thread available', async () => {
      // Arrange
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'dicoding thread',
        body: 'dicoding body thread',
        owner: userId,
      });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadRepositoryPostgres.verifyThreadExist('thread-123')).resolves.not.toThrowError(NotFoundError);
    });
  });

  describe('verifyThreadAccess function', () => {
    it('should throw AuthorizationError when thread cannot be accessed', async () => {
      const unauthorizedUserId = 'user-321';
      // Arrange
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'dicoding thread',
        body: 'dicoding body thread',
        owner: userId,
      });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadRepositoryPostgres.verifyThreadAccess(unauthorizedUserId, 'thread-123')).rejects.toThrowError(AuthorizationError);
    });

    it('should not throw AuthorizationError when thread can be accessed', async () => {
      // Arrange
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'dicoding thread',
        body: 'dicoding body thread',
        owner: userId,
      });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadRepositoryPostgres.verifyThreadAccess(userId, 'thread-123')).resolves.not.toThrowError(AuthorizationError);
    });
  });

  describe('getThread function', () => {
    it('should return thread correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        id: userId,
        username: 'dicoding',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
      });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'dicoding thread',
        body: 'dicoding body thread',
        owner: userId,
      });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      const gotThread = await threadRepositoryPostgres.getThread('thread-123');
      expect(gotThread).not.toBeNull();
      expect(gotThread).toEqual(new GetThread({
        id: 'thread-123',
        title: 'dicoding thread',
        body: 'dicoding body thread',
        date: expect.any(Date),
        username: 'dicoding',
      }));
    });
  });
});
