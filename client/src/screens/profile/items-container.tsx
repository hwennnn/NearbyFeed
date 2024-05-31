import React from 'react';

import type { TxKeyPath } from '@/core';
import { Text, View } from '@/ui';

type Props = {
  children: React.ReactNode;
  title?: TxKeyPath;
};

export const ItemsContainer = ({ children, title }: Props) => {
  return (
    <>
      {title && <Text variant="lg" className="pb-2 pt-4" tx={title} />}
      {
        <View className="rounded-md border border-neutral-200 dark:border-charcoal-700 dark:bg-charcoal-800">
          {children}
        </View>
      }
    </>
  );
};
