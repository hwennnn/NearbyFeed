import * as React from 'react';

import type { TxKeyPath } from '@/core';
import { ArrowRight, Text, TouchableOpacity, View } from '@/ui';

type ItemProps = {
  text: TxKeyPath;
  value?: string;
  onPress?: () => void;
  icon?: React.ReactNode;
  textProps?: string;
};

export const BottomSheetItem = ({
  text,
  value,
  icon,
  onPress,
  textProps,
}: ItemProps) => {
  const isPressable = onPress !== undefined;
  const Container = isPressable ? TouchableOpacity : View;
  return (
    <Container
      onPress={onPress}
      className="flex-1 flex-row items-center justify-between px-4 py-2"
    >
      <View className="flex-row items-center">
        {icon && <View className="pr-2">{icon}</View>}
        <Text variant="md" tx={text} className={textProps ?? ''} />
      </View>
      <View className="flex-row items-center">
        <Text variant="md" className="text-neutral-600 dark:text-white">
          {value}
        </Text>
        {isPressable && (
          <View className="pl-2">
            <ArrowRight />
          </View>
        )}
      </View>
    </Container>
  );
};
