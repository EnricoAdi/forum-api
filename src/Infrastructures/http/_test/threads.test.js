/* eslint-disable linebreak-style */
/* eslint-disable no-undef */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-vars */
/* eslint-disable no-underscore-dangle */
/* eslint-disable class-methods-use-this */
const pool = require('../../database/postgres/pool');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const CommentLikeTableTestHelper = require('../../../../tests/CommentLikeTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');
const ServerTestHelper = require('../../../../tests/ServerTestHelper');

describe('/threads endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await RepliesTableTestHelper.cleanTable();
  });

  describe('when POST /threads', () => {
    it('should response 201 and added thread', async () => {
      // Arrange
      const requestPayload = {
        title: 'sebuah thread',
        body: 'isi sebuah thread',
      };
      const accessToken = await ServerTestHelper.getAccessToken();
      // eslint-disable-next-line no-undef
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedThread).toBeDefined();
    });

    it('should response 401 when request header not contain bearer token', async () => {
      // Arrange
      const requestPayload = {
        title: 'sebuah thread',
        body: 'isi sebuah thread',
      };

      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      const requestPayload = {
        title: 'sebuah thread',
      };

      const accessToken = await ServerTestHelper.getAccessToken();
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      // Arrange
      const requestPayload = {
        title: 1,
        body: 'isi sebuah thread',
      };
      const accessToken = await ServerTestHelper.getAccessToken();
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena tipe data tidak sesuai');
    });
  });

  describe('when POST /threads/{threadId}/comments', () => {
    it('should response 201 and added comment', async () => {
      // Arrange
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'dicoding thread',
        body: 'dicoding body thread',
        owner: 'user-123',
      });

      const requestPayload = {
        content: 'sebuah comment',
      };
      const accessToken = await ServerTestHelper.getAccessToken();
      // eslint-disable-next-line no-undef
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments',
        payload: requestPayload,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedComment).toBeDefined();
    });

    it('should response 401 when request header not contain bearer token', async () => {
      // Arrange

      const requestPayload = {
        content: 'sebuah comment',
      };

      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments',
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      const requestPayload = {
        commentar: 'sebuah comment',
      };

      const accessToken = await ServerTestHelper.getAccessToken();
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments',
        payload: requestPayload,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat comment baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      // Arrange

      const requestPayload = {
        content: true,
      };
      const accessToken = await ServerTestHelper.getAccessToken();
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments',
        payload: requestPayload,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat comment baru karena tipe data tidak sesuai');
    });

    it('should response 404 when thread not found', async () => {
      // Arrange

      const requestPayload = {
        content: 'sebuah content',
      };
      const accessToken = await ServerTestHelper.getAccessToken();
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-121/comments',
        payload: requestPayload,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak ditemukan');
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}', () => {
    const commentId = 'comment-123';
    const threadId = 'thread-123';
    const userId = 'user-123';
    it('should response 200 and soft delete a comment', async () => {
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

      const accessToken = await ServerTestHelper.getAccessToken();
      // eslint-disable-next-line no-undef
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-123',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');

      // Assert
      const comments = await CommentsTableTestHelper.findCommentsById(commentId);
      const getComment = comments[0];

      // Assert
      expect(getComment.is_delete).toStrictEqual(true);
    });

    it('should response 401 when request header not contain bearer token', async () => {
      // Arrange

      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-123',
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 403 when comment was not accessable', async () => {
      // Arrange
      const payloadUnauthorizedUser = {
        id: 'user-111',
        username: 'sus',
        password: 'sus',
        fullname: 'Dicoding Amerika',
      };
      const unauthorizedToken = await ServerTestHelper.generateAccessToken(payloadUnauthorizedUser);

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
        owner: 'user-123',
        is_delete: false,
      });

      // eslint-disable-next-line no-undef
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-123',
        headers: {
          authorization: `Bearer ${unauthorizedToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('comment tidak dapat diakses karena bukan owner');
    });

    it('should response 404 when thread not found', async () => {
      // Arrange
      const accessToken = await ServerTestHelper.getAccessToken();
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-121/comments/comment-123',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak ditemukan');
    });

    it('should response 404 when comment not found', async () => {
      // Arrange
      const accessToken = await ServerTestHelper.getAccessToken();
      const server = await createServer(container);

      await ThreadsTableTestHelper.addThread({
        id: threadId,
        title: 'dicoding thread',
        body: 'dicoding body thread',
        owner: userId,
      });
      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-121',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('comment tidak ditemukan');
    });
  });

  describe('when GET /threads/{threadId}', () => {
    const threadId = 'thread-123';
    const userId = 'user-123';

    it('should response 200 and return a thread', async () => {
      // Arrange
      await ThreadsTableTestHelper.addThread({
        id: threadId,
        title: 'dicoding thread',
        body: 'dicoding body thread',
        owner: userId,
      });

      // eslint-disable-next-line no-undef
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'GET',
        url: '/threads/thread-123',
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread).toBeDefined();
      expect(responseJson.data.thread.comments).toBeDefined();
    });

    it('should response 404 when thread not found', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'GET',
        url: '/threads/thread-121',
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak ditemukan');
    });
  });

  describe('when POST /threads/{threadId}/comments/{commentId}/replies', () => {
    const threadId = 'thread-123';
    const userId = 'user-123';
    const commentId = 'comment-123';

    it('should response 201 and added reply', async () => {
      // Arrange
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'dicoding thread',
        body: 'dicoding body thread',
        owner: 'user-123',
      });
      await CommentsTableTestHelper.addComment({
        id: commentId,
        content: 'dicoding comment',
        thread_id: threadId,
        owner: userId,
        is_delete: false,
      });

      const requestPayload = {
        content: 'sebuah reply',
      };
      const accessToken = await ServerTestHelper.getAccessToken();
      // eslint-disable-next-line no-undef
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments/comment-123/replies',
        payload: requestPayload,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedReply).toBeDefined();
    });

    it('should response 401 when request header not contain bearer token', async () => {
      // Arrange

      const requestPayload = {
        content: 'sebuah reply',
      };

      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments/comment-123/replies',
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      const requestPayload = {
        repl: 'sebuah reply',
      };

      const accessToken = await ServerTestHelper.getAccessToken();
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments/comment-123/replies',
        payload: requestPayload,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat reply baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      // Arrange

      const requestPayload = {
        content: true,
      };
      const accessToken = await ServerTestHelper.getAccessToken();
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments/comment-123/replies',
        payload: requestPayload,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat reply baru karena tipe data tidak sesuai');
    });

    it('should response 404 when thread and comment not found', async () => {
      // Arrange

      const requestPayload = {
        content: 'sebuah content',
      };
      const accessToken = await ServerTestHelper.getAccessToken();
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-121/comments/comment-121/replies',
        payload: requestPayload,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak ditemukan');
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}', () => {
    const threadId = 'thread-123';
    const userId = 'user-123';
    const commentId = 'comment-123';
    const replyId = 'reply-123';

    it('should response 200 and soft delete a reply', async () => {
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
      const accessToken = await ServerTestHelper.getAccessToken();
      // eslint-disable-next-line no-undef
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-123/replies/reply-123',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');

      // Assert
      const replies = await RepliesTableTestHelper.findRepliesById(replyId);
      const getReply = replies[0];

      // Assert
      expect(getReply.is_delete).toStrictEqual(true);
    });

    it('should response 404 when thread, comment, and reply not found', async () => {
      // Arrange

      const accessToken = await ServerTestHelper.getAccessToken();
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-121/comments/comment-121/replies/reply-321',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak ditemukan');
    });

    it('should response 401 when request header not contain bearer token', async () => {
      // Arrange

      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-123/replies/reply-123',
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 403 when reply was not accessable', async () => {
      // Arrange
      const payloadUnauthorizedUser = {
        id: 'user-111',
        username: 'sus',
        password: 'sus',
        fullname: 'Dicoding Amerika',
      };
      const unauthorizedToken = await ServerTestHelper.generateAccessToken(payloadUnauthorizedUser);

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
        owner: 'user-123',
        is_delete: false,
      });

      await RepliesTableTestHelper.addReply({
        id: replyId,
        content: 'dicoding reply',
        comment_id: commentId,
        owner: 'user-123',
        is_delete: false,
      });

      // eslint-disable-next-line no-undef
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-123/replies/reply-123',
        headers: {
          authorization: `Bearer ${unauthorizedToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('reply tidak dapat diakses karena bukan owner');
    });
  });

  describe('when PUT /threads/{threadId}/comments/{commentId}/likes', () => {
    const threadId = 'thread-123';
    const userId = 'user-123';
    const commentId = 'comment-123';

    it('should response 200 and add like if user didnt like the comment yet', async () => {
      // Arrange
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'dicoding thread',
        body: 'dicoding body thread',
        owner: 'user-123',
      });
      await CommentsTableTestHelper.addComment({
        id: commentId,
        content: 'dicoding comment',
        thread_id: threadId,
        owner: userId,
        is_delete: false,
      });

      const accessToken = await ServerTestHelper.getAccessToken();
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: '/threads/thread-123/comments/comment-123/likes',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');

      let likeCount = await CommentLikeTableTestHelper.getCountLikeFromUser(userId, commentId);
      likeCount = parseInt(likeCount, 10);
      expect(likeCount).toEqual(1);
    });

    it('should response 200 and delete like if user already like the comment', async () => {
      // Arrange
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'dicoding thread',
        body: 'dicoding body thread',
        owner: 'user-123',
      });
      await CommentsTableTestHelper.addComment({
        id: commentId,
        content: 'dicoding comment',
        thread_id: threadId,
        owner: userId,
        is_delete: false,
      });

      const accessToken = await ServerTestHelper.getAccessToken();
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: '/threads/thread-123/comments/comment-123/likes',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');

      let likeCount = await CommentLikeTableTestHelper.getCountLikeFromUser(userId, commentId);
      likeCount = parseInt(likeCount, 10);
      expect(likeCount).toEqual(0);
    });

    it('should response 401 when request header not contain bearer token', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: '/threads/thread-123/comments/comment-123/likes',
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 404 when thread and comment not found', async () => {
      // Arrange
      const accessToken = await ServerTestHelper.getAccessToken();
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: '/threads/thread-121/comments/comment-121/likes',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak ditemukan');
    });
  });
});
