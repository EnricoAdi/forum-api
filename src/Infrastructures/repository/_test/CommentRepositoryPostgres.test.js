/* eslint-disable linebreak-style */
/* eslint-disable no-undef */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-vars */
/* eslint-disable no-underscore-dangle */
/* eslint-disable class-methods-use-this */
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

const AddComment = require('../../../Domains/comments/entities/AddComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');

const pool = require('../../database/postgres/pool');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');

describe('CommentRepositoryPostgres', () => {
  const userId = 'user-123';
  const threadId = 'thread-123';
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addComment function', () => {
    it('should persist add comment and return added comment correctly', async () => {
      // Arrange
      await ThreadsTableTestHelper.addThread({
        id: threadId,
        title: 'dicoding thread',
        body: 'dicoding body thread',
        owner: userId,
      });

      const addComment = new AddComment({
        content: 'dicoding comment',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedComment = await commentRepositoryPostgres.addComment(userId, threadId, addComment);

      // Assert
      const comments = await CommentsTableTestHelper.findCommentsById('comment-123');
      expect(comments).toHaveLength(1);

      // Assert
      expect(addedComment).toStrictEqual(new AddedComment({
        id: 'comment-123',
        content: 'dicoding comment',
        owner: userId,
      }));
    });
  });

  describe('deleteComment function', () => {
    const commentId = 'comment-123';
    it('should persist delete comment correctly', async () => {
      // Arrange
      await ThreadsTableTestHelper.addThread({
        id: threadId,
        title: 'dicoding thread',
        body: 'dicoding body thread',
        owner: userId,
      });
      await CommentsTableTestHelper.addComment({
        id: commentId,
        content: 'dicoding comment',
        thread_id: threadId,
        owner: userId,
        is_delete: false,
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      await commentRepositoryPostgres.deleteComment(commentId);

      // Assert
      const comments = await CommentsTableTestHelper.findCommentsById(commentId);
      const getComment = comments[0];

      expect(comments).toHaveLength(1);
      expect(getComment.is_delete).toStrictEqual(true);
    });
  });

  describe('verifyCommentExist function', () => {
    it('should throw NotFoundError when comment not available', async () => {
      // Arrange
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'dicoding thread',
        body: 'dicoding body thread',
        owner: 'user-123',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        content: 'dicoding comment',
        thread_id: 'thread-123',
        owner: 'user-123',
        is_delete: false,
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyCommentExist('comment-124')).rejects.toThrowError(NotFoundError);
    });

    it('should not throw NotFoundError when comment available', async () => {
      // Arrange
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'dicoding thread',
        body: 'dicoding body thread',
        owner: userId,
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        content: 'dicoding comment',
        thread_id: 'thread-123',
        owner: userId,
        is_delete: false,
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyCommentExist('comment-123')).resolves.not.toThrowError(NotFoundError);
    });
  });

  describe('verifyCommentAccess function', () => {
    it('should throw AuthorizationError when comment cannot be accessed', async () => {
      const unauthorizedUserId = 'user-321';
      // Arrange
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

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyCommentAccess(unauthorizedUserId, 'comment-123')).rejects.toThrowError(AuthorizationError);
    });

    it('should not throw AuthorizationError when comment can be accessed', async () => {
      // Arrange
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
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

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyCommentAccess(userId, 'comment-123')).resolves.not.toThrowError(AuthorizationError);
    });
  });

  describe('fetchCommentByThreadId function', () => {
    it('should return list of comments correctly', async () => {
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
      await CommentsTableTestHelper.addComment({
        id: 'comment-124',
        content: 'dicoding comment',
        thread_id: threadId,
        owner: userId,
        is_delete: false,
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      const gotComments = await commentRepositoryPostgres.fetchCommentByThreadId('thread-123');

      const expectedComments = await CommentsTableTestHelper.findCommentsByThreadId('thread-123');
      expect(gotComments).not.toBeNull();
      expect(gotComments).toHaveLength(2);
      expect(gotComments).toEqual(expectedComments);
    });
  });
});
