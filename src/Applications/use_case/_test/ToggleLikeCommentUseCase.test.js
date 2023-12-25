/* eslint-disable linebreak-style */
/* eslint-disable no-console */
/* eslint-disable no-undef */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-vars */
/* eslint-disable no-underscore-dangle */
/* eslint-disable class-methods-use-this */
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentLikeRepository = require('../../../Domains/commentLikes/CommentLikeRepository');

const ToggleLikeCommentUseCase = require('../ToggleLikeCommentUseCase');

describe('ToggleLikeCommentUseCase', () => {
  it('should orchestrating the toggle comment like with add action correctly', async () => {
    // Arrange
    const userId = 'user-123';
    const threadId = 'thread-123';
    const commentId = 'comment-123';
    const commentLikeId = 'commentLike-123';
    const totalLike = 0;

    /** creating dependency of use case */
    const mockCommentLikeRepository = new CommentLikeRepository();
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThreadExist = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentExist = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentLikeRepository.getCountLikeFromUser = jest.fn()
      .mockImplementation(() => Promise.resolve(totalLike));
    mockCommentLikeRepository.addLike = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentLikeRepository.deleteLike = jest.fn()
      .mockImplementation(() => Promise.resolve());

    /** creating use case instance */
    const toggleLikeCommentUseCase = new ToggleLikeCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
      commentLikeRepository: mockCommentLikeRepository,
    });

    // Action
    await toggleLikeCommentUseCase.execute(userId, threadId, commentId);

    // Assert
    expect(mockThreadRepository.verifyThreadExist).toBeCalledWith(threadId);
    expect(mockCommentRepository.verifyCommentExist).toBeCalledWith(commentId);
    expect(mockCommentLikeRepository.getCountLikeFromUser).toBeCalledWith(userId, commentId);
    if (totalLike < 1) {
      expect(mockCommentLikeRepository.addLike).toBeCalledWith(userId, commentId);
      expect(mockCommentLikeRepository.deleteLike).not.toBeCalled();
    } else {
      expect(mockCommentLikeRepository.addLike).not.toBeCalled();
      expect(mockCommentLikeRepository.deleteLike).toBeCalledWith(userId, commentId);
    }
  });
  it('should orchestrating the toggle comment like with delete action correctly', async () => {
    // Arrange
    const userId = 'user-123';
    const threadId = 'thread-123';
    const commentId = 'comment-123';
    const commentLikeId = 'commentLike-123';
    const totalLike = 1;

    /** creating dependency of use case */
    const mockCommentLikeRepository = new CommentLikeRepository();
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThreadExist = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentExist = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentLikeRepository.getCountLikeFromUser = jest.fn()
      .mockImplementation(() => Promise.resolve(totalLike));
    mockCommentLikeRepository.addLike = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentLikeRepository.deleteLike = jest.fn()
      .mockImplementation(() => Promise.resolve());

    /** creating use case instance */
    const toggleLikeCommentUseCase = new ToggleLikeCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
      commentLikeRepository: mockCommentLikeRepository,
    });

    // Action
    await toggleLikeCommentUseCase.execute(userId, threadId, commentId);

    // Assert
    expect(mockThreadRepository.verifyThreadExist).toBeCalledWith(threadId);
    expect(mockCommentRepository.verifyCommentExist).toBeCalledWith(commentId);
    expect(mockCommentLikeRepository.getCountLikeFromUser).toBeCalledWith(userId, commentId);
    if (totalLike < 1) {
      expect(mockCommentLikeRepository.addLike).toBeCalledWith(userId, commentId);
      expect(mockCommentLikeRepository.deleteLike).not.toBeCalled();
    } else {
      expect(mockCommentLikeRepository.addLike).not.toBeCalled();
      expect(mockCommentLikeRepository.deleteLike).toBeCalledWith(userId, commentId);
    }
  });
});
