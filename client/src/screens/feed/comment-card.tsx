import React from 'react';

import type { Comment } from '@/api';
import { Text, TimeWidget, View } from '@/ui';

type Props = Comment;

export const CommentCard = ({ content, createdAt, author }: Props) => {
  return (
    <View className="my-2 block space-y-1 overflow-hidden rounded-xl bg-neutral-200 p-2 shadow-xl dark:bg-charcoal-900">
      <View className="flex-row items-center justify-between">
        <Text variant="sm" className="font-semibold text-black dark:text-white">
          {author?.username ?? ''}
        </Text>

        <TimeWidget variant="sm" time={createdAt!} />
      </View>
      <Text variant="sm">{`${content}`}</Text>
    </View>
  );
};
