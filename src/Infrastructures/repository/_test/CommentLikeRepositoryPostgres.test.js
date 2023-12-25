/* eslint-disable linebreak-style */
/* eslint-disable no-undef */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-vars */
/* eslint-disable no-underscore-dangle */
/* eslint-disable class-methods-use-this */
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const CommentLikeTableTestHelper = require('../../../../tests/CommentLikeTableTestHelper');

const pool = require('../../database/postgres/pool');
const CommentLikeRepositoryPostgres = require('../CommentLikeRepositoryPostgres');

describe('CommentLikeRepositoryPostgres', () => {
  const userId = 'user-123';
  const threadId = 'thread-123';
  const commentId = 'comment-123';
  const commentLikeId = 'commentLike-123';
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await CommentLikeTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });
  describe('getCountLikeFromUser function', () => {
    it('should return number of comment like from a user correctly', async () => {
      await UsersTableTestHelper.addUser({
        id: userId,
        username: 'dicoding',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
      });
      await ThreadsTableTestHelper.addThread({
        id: threadId,
        title: 'dicoding thread',
        body: 'dicoding body thread',
        owner: userId,
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        content: 'dicoding comment',
        thread_id: threadId,
        owner: userId,
        is_delete: false,
      });
      await CommentLikeTableTestHelper.addLike({
        id: 'commentLike-123',
        owner: userId,
        comment_id: commentId,
      });

      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(pool, {});
      let likeCount = await commentLikeRepositoryPostgres.getCountLikeFromUser(userId, commentId);
      likeCount = parseInt(likeCount, 10);
      expect(likeCount).toEqual(1);
    });
  });
  describe('addLike function', () => {
    it('should persist add comment like correctly', async () => {
      await UsersTableTestHelper.addUser({
        id: userId,
        username: 'dicoding',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
      });
      await ThreadsTableTestHelper.addThread({
        id: threadId,
        title: 'dicoding thread',
        body: 'dicoding body thread',
        owner: userId,
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        content: 'dicoding comment',
        thread_id: threadId,
        owner: userId,
        is_delete: false,
      });

      const fakeIdGenerator = () => '123'; // stub!
      // eslint-disable-next-line max-len
      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(pool, fakeIdGenerator);
      await commentLikeRepositoryPostgres.addLike(userId, commentId);

      let likeCount = await CommentLikeTableTestHelper.getCountLikeFromUser(userId, commentId);
      likeCount = parseInt(likeCount, 10);
      expect(likeCount).toEqual(1);
    });
  });
  describe('deleteLike function', () => {
    it('should persist delete comment like correctly', async () => {
      await UsersTableTestHelper.addUser({
        id: userId,
        username: 'dicoding',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
      });
      await ThreadsTableTestHelper.addThread({
        id: threadId,
        title: 'dicoding thread',
        body: 'dicoding body thread',
        owner: userId,
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        content: 'dicoding comment',
        thread_id: threadId,
        owner: userId,
        is_delete: false,
      });
      await CommentLikeTableTestHelper.addLike({
        id: 'commentLike-123',
        owner: userId,
        comment_id: commentId,
      });

      // eslint-disable-next-line max-len
      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(pool, {});
      await commentLikeRepositoryPostgres.deleteLike(userId, commentId);

      let likeCount = await CommentLikeTableTestHelper.getCountLikeFromUser(userId, commentId);
      likeCount = parseInt(likeCount, 10);
      expect(likeCount).toEqual(0);
    });
  });
  describe('countLike function', () => {
    it('should return number of comment like from a comment correctly', async () => {
      await UsersTableTestHelper.addUser({
        id: userId,
        username: 'dicoding',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
      });
      await ThreadsTableTestHelper.addThread({
        id: threadId,
        title: 'dicoding thread',
        body: 'dicoding body thread',
        owner: userId,
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        content: 'dicoding comment',
        thread_id: threadId,
        owner: userId,
        is_delete: false,
      });
      await CommentLikeTableTestHelper.addLike({
        id: 'commentLike-123',
        owner: userId,
        comment_id: commentId,
      });
      await CommentLikeTableTestHelper.addLike({
        id: 'commentLike-124',
        owner: 'user-124',
        comment_id: commentId,
      });

      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(pool, {});
      let likeCount = await commentLikeRepositoryPostgres.countLike(commentId);
      likeCount = parseInt(likeCount, 10);
      expect(likeCount).toEqual(2);
    });
  });
});
