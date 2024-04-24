import type { AxiosError } from 'axios';
import { createMutation } from 'react-query-kit';

import type { Comment, CommentLike } from '@/api/types';
import type { CommentsSort } from '@/core/comments';
import { useCommentKeys } from '@/core/comments';

import { client, queryClient } from '../common';

type Variables = {
  postId: string;
  commentId: string;
  value: number;
};
type Response = {
  like: CommentLike;
  comment: Comment;
};
type CommentsResponse = {
  comments: Comment[];
  hasMore: boolean;
};
export type InfiniteComments = {
  pages: CommentsResponse[];
  pageParams: unknown[];
};
type Context = {
  previousComments?: InfiniteComments;
  newComment: Variables;
  previousComment?: Comment;
};

export const useVoteComment = createMutation<
  Response,
  Variables,
  AxiosError,
  Context
>({
  mutationFn: async (variables) =>
    client({
      url: `posts/${variables.postId}/comments/${variables.commentId}/vote`,
      method: 'PUT',
      data: {
        value: variables.value,
      },
    })
      .then((response) => response.data)
      .catch((error) => {
        return Promise.reject(error);
      }),
  // When mutate is called:
  onMutate: async (newComment) => {
    // 1. Handle the infinite comments
    const commentsQueryKey = retrieveUseCommentsKey(
      +newComment.postId,
      useCommentKeys.getState().commentsQueryKey.sort
    );

    // Cancel any outgoing refetches
    // (so they don't overwrite our optimistic update)
    await queryClient.cancelQueries({ queryKey: commentsQueryKey });

    // Snapshot the previous value
    const previousComments =
      queryClient.getQueryData<InfiniteComments>(commentsQueryKey);

    // Update the cache optimistically by modifying the points value on the existing list
    queryClient.setQueryData<InfiniteComments>(commentsQueryKey, (oldData) => {
      if (oldData) {
        return {
          pageParams: oldData.pageParams,
          pages: oldData.pages.map((page) => {
            const foundIndex = page.comments.findIndex(
              (comment) => comment.id.toString() === newComment.commentId
            );

            if (foundIndex !== -1) {
              const updatedComments = [...page.comments];
              const newOptimisticComment = retrieveNewOptimisticComment(
                updatedComments[foundIndex],
                newComment.value
              );

              updatedComments[foundIndex] = {
                ...newOptimisticComment,
              };
              return { ...page, comments: updatedComments };
            }

            return page;
          }),
        };
      }
      return oldData;
    });

    // 2. Handle the single comment query
    const commentQueryKey = [
      'posts',
      { postId: +newComment.postId, commentId: +newComment.commentId },
    ];

    // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
    await queryClient.cancelQueries({ queryKey: commentQueryKey });

    // Snapshot the previous value
    const previousComment = queryClient.getQueryData<Comment>(commentQueryKey);

    queryClient.setQueryData<Comment>(commentQueryKey, (oldData) => {
      if (oldData) {
        const newOptimisticComment = retrieveNewOptimisticComment(
          oldData,
          newComment.value
        );

        return { ...newOptimisticComment };
      }

      return oldData;
    });

    // Return a context with the previous and new todo
    return { previousComments, newComment, previousComment };
  },
  // If the mutation fails, use the context we returned above
  onError: (_err, newComment, context) => {
    const commentsQueryKey = retrieveUseCommentsKey(
      +newComment.postId,
      useCommentKeys.getState().commentsQueryKey.sort
    );

    queryClient.setQueryData<InfiniteComments>(
      commentsQueryKey,
      context?.previousComments
    );

    const commentQueryKey = [
      'posts',
      { postId: +newComment.postId, commentId: +newComment.commentId },
    ];

    queryClient.setQueryData<Comment>(
      commentQueryKey,
      context?.previousComment
    );
  },
  // Update the cache after success:
  onSuccess: (data, newComment) => {
    const commentsQueryKey = retrieveUseCommentsKey(
      +newComment.postId,
      useCommentKeys.getState().commentsQueryKey.sort
    );

    queryClient.setQueryData<InfiniteComments>(commentsQueryKey, (oldData) => {
      if (oldData) {
        return {
          pageParams: oldData.pageParams,
          pages: oldData.pages.map((page) => {
            const foundIndex = page.comments.findIndex(
              (comment) => comment.id.toString() === newComment.commentId
            );

            if (foundIndex !== -1) {
              const updatedComments = [...page.comments];
              updatedComments[foundIndex] = {
                author: updatedComments[foundIndex].author,
                ...data.comment,
                like: data.like,
              };
              return { ...page, comments: updatedComments };
            }

            return page;
          }),
        };
      }
      return oldData;
    });

    const commentQueryKey = [
      'posts',
      { postId: +newComment.postId, commentId: +newComment.commentId },
    ];

    queryClient.setQueryData<Comment>(commentQueryKey, (oldData) => {
      if (oldData) {
        return {
          author: oldData.author,
          ...data.comment,
          like: data.like,
        };
      }

      return oldData;
    });
  },
});

const retrieveNewOptimisticComment = (
  comment: Comment,
  value: number
): Comment => {
  let like = comment.like ?? null;

  let incrementValue = value;

  // If the user has already liked the comment
  if (like !== null) {
    // If the user's vote is the same as the current vote
    if (like.value === value) {
      // nothing changed
      incrementValue = 0;
    } else {
      if (value === 1) {
        incrementValue = 1;
      } else {
        incrementValue = -1;
      }
    }
  }

  return {
    ...comment,
    points: comment.points + incrementValue,
    like:
      like !== null
        ? {
            ...like,
            value,
          }
        : {
            id: new Date().getTime(),
            value,
            createdAt: new Date(),
            updatedAt: new Date(),
            commentId: comment.id,
            userId: -1,
          },
  };
};

export const retrieveUseCommentsKey = (
  postId: number,
  commentsSort: CommentsSort
): any => {
  return [
    'comments',
    {
      postId,
      sort: commentsSort.toString(),
    },
  ];
};
