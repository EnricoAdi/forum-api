/* eslint-disable linebreak-style */
/* eslint-disable no-undef */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-vars */
/* eslint-disable no-underscore-dangle */
/* eslint-disable class-methods-use-this */
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

const AddReply = require('../../../Domains/replies/entities/AddReply');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');

const pool = require('../../database/postgres/pool');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');

describe('ReplyRepositoryPostgres', () => {
  const userId = 'user-123';
  const threadId = 'thread-123';
  const commentId = 'comment-123';
  const replyId = 'reply-123';
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await RepliesTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addReply function', () => {
    it('should persist add reply and return added reply correctly', async () => {
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

      const addReply = new AddReply({
        content: 'dicoding reply',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedReply = await replyRepositoryPostgres.addReply(userId, commentId, addReply);

      // Assert
      const replies = await RepliesTableTestHelper.findRepliesById('reply-123');
      expect(replies).toHaveLength(1);

      // Assert
      expect(addedReply).toStrictEqual(new AddedReply({
        id: 'reply-123',
        content: 'dicoding reply',
        owner: userId,
      }));
    });
  });

  describe('deleteReply function', () => {
    it('should persist delete reply correctly', async () => {
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
      await RepliesTableTestHelper.addReply({
        id: replyId,
        content: 'dicoding reply',
        comment_id: commentId,
        owner: userId,
        is_delete: false,
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      await replyRepositoryPostgres.deleteReply(replyId);

      // Assert
      const replies = await RepliesTableTestHelper.findRepliesById(replyId);
      const getReply = replies[0];

      // Assert
      expect(replies).toHaveLength(1);
      expect(getReply.is_delete).toStrictEqual(true);
    });
  });

  describe('verifyReplyExist function', () => {
    it('should throw NotFoundError when reply not available', async () => {
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

      await RepliesTableTestHelper.addReply({
        id: replyId,
        content: 'dicoding reply',
        comment_id: commentId,
        owner: userId,
        is_delete: false,
      });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(replyRepositoryPostgres.verifyReplyExist('reply-124')).rejects.toThrowError(NotFoundError);
    });

    it('should not throw NotFoundError when reply available', async () => {
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

      await RepliesTableTestHelper.addReply({
        id: replyId,
        content: 'dicoding reply',
        comment_id: commentId,
        owner: userId,
        is_delete: false,
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(replyRepositoryPostgres.verifyReplyExist('reply-123')).resolves.not.toThrowError(NotFoundError);
    });
  });

  describe('verifyReplyAccess function', () => {
    it('should throw AuthorizationError when reply cannot be accessed', async () => {
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
      await RepliesTableTestHelper.addReply({
        id: replyId,
        content: 'dicoding reply',
        comment_id: commentId,
        owner: userId,
        is_delete: false,
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(replyRepositoryPostgres.verifyReplyAccess(unauthorizedUserId, 'reply-123')).rejects.toThrowError(AuthorizationError);
    });

    it('should not throw AuthorizationError when reply can be accessed', async () => {
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

      await RepliesTableTestHelper.addReply({
        id: replyId,
        content: 'dicoding reply',
        comment_id: commentId,
        owner: userId,
        is_delete: false,
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(replyRepositoryPostgres.verifyReplyAccess(userId, 'reply-123')).resolves.not.toThrowError(AuthorizationError);
    });
  });

  describe('fetchReplyByCommentId function', () => {
    it('should return list of replies correctly', async () => {
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
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        content: 'dicoding reply',
        comment_id: commentId,
        owner: userId,
        is_delete: false,
      });
      await RepliesTableTestHelper.addReply({
        id: 'reply-124',
        content: 'dicoding reply 2',
        comment_id: commentId,
        owner: userId,
        is_delete: false,
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});
      const gotReplies = await replyRepositoryPostgres.fetchReplyByCommentId('comment-123');
      const expectedReplies = await RepliesTableTestHelper.findRepliesByCommentId('comment-123');
      expect(gotReplies).not.toBeNull();
      expect(gotReplies).toHaveLength(2);
      expect(gotReplies).toEqual(expectedReplies);
    });
  });
});
