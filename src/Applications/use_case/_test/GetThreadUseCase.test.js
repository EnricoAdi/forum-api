/* eslint-disable linebreak-style */
/* eslint-disable no-undef */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-vars */
/* eslint-disable no-underscore-dangle */
/* eslint-disable class-methods-use-this */
const GetThread = require('../../../Domains/threads/entities/GetThread');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const CommentLikeRepository = require('../../../Domains/commentLikes/CommentLikeRepository');
const GetThreadUseCase = require('../GetThreadUseCase');

describe('GetThreadUseCase', () => {
  /**
   * Menguji apakah use case get thread mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it('should orchestrating the get thread action correctly', async () => {
    // Arrange
    const userId = 'user-123';
    const threadId = 'thread-123';
    const date = new Date().toISOString();

    const mockGetThread = new GetThread({
      id: threadId,
      title: 'contoh thread',
      body: 'contoh body thread',
      date,
      username: 'dicoding',
    });

    const mockReply = [{
      id: 'reply-123',
      username: 'dicoding',
      date,
      content: 'contoh balasan',
      is_delete: false,
    }, {
      id: 'reply-124',
      username: 'dicoding',
      date,
      content: 'contoh balasan 2',
      is_delete: true,
    }];

    const mockComment = [
      {
        id: 'comment-123',
        username: 'dicoding',
        date,
        content: 'contoh komentar',
        is_delete: false,
      },
      {
        id: 'comment-124',
        username: 'dicoding',
        date,
        content: 'contoh komentar 2',
        is_delete: true,
      },
    ];

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();
    const mockCommentLikeRepository = new CommentLikeRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThreadExist = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockThreadRepository.getThread = jest.fn()
      .mockImplementation(() => Promise.resolve(mockGetThread));

    mockCommentRepository.fetchCommentByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(mockComment));
    mockReplyRepository.fetchReplyByCommentId = jest.fn()
      .mockImplementation(() => Promise.resolve(mockReply));

    mockCommentLikeRepository.countLike = jest.fn()
      .mockImplementation(() => Promise.resolve(0));

    /** creating use case instance */
    const getThreadUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
      commentLikeRepository: mockCommentLikeRepository,
    });

    // Action
    const gotThread = await getThreadUseCase.execute(threadId);

    // Assert
    expect(gotThread).toEqual({
      id: threadId,
      title: 'contoh thread',
      body: 'contoh body thread',
      date,
      username: 'dicoding',
      comments: [
        {
          id: 'comment-123',
          username: 'dicoding',
          date,
          content: 'contoh komentar',
          likeCount: 0,
          replies: [
            {
              id: 'reply-123',
              username: 'dicoding',
              date,
              content: 'contoh balasan',
            },
            {
              id: 'reply-124',
              username: 'dicoding',
              date,
              content: '**balasan telah dihapus**',
            },
          ],
        },
        {
          id: 'comment-124',
          username: 'dicoding',
          date,
          content: '**komentar telah dihapus**',
          likeCount: 0,
          replies: [
            {
              id: 'reply-123',
              username: 'dicoding',
              date,
              content: 'contoh balasan',
            },
            {
              id: 'reply-124',
              username: 'dicoding',
              date,
              content: '**balasan telah dihapus**',
            },
          ],
        },
      ],
    });

    expect(mockThreadRepository.verifyThreadExist).toHaveBeenCalledWith(threadId);
    expect(mockThreadRepository.getThread).toHaveBeenCalledWith(threadId);
    expect(mockCommentRepository.fetchCommentByThreadId).toHaveBeenCalledWith(threadId);
    expect(mockReplyRepository.fetchReplyByCommentId).toHaveBeenCalledWith('comment-123');
  });
});
