import React from 'react';
import { useAuth } from '@/core';
import { TabNavigator } from '@/navigation/tab-navigator';
import { AddFeed, FeedDetails } from '@/screens';
import { CommentsDetails } from '@/screens/feed/comment-details';
import { MyComments } from '@/screens/profile/my-comments';
import { MyPosts } from '@/screens/profile/my-posts';
import { HeaderButton } from '@/ui';
import { AuthNavigator } from './auth-navigator';
import { Stack } from './root-navigator';

export const Root = () => {
  const status = useAuth.use.status();

  const hideSplash = React.useCallback(async () => {
    await SplashScreen.hideAsync();
  }, []);

  useEffect(() => {
    if (status !== 'idle') {
      hideSplash();
    }
  }, [hideSplash, status]);

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: false,
        animation: 'none',
      }}
    >
      <Stack.Group>
        {status === 'signOut' ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          <>
            <Stack.Screen name="App" component={TabNavigator} />
            <Stack.Group
              screenOptions={{
                headerShown: true,
                animation: 'default',
                gestureEnabled: true,
              }}
            >
              <Stack.Screen
                name="AddFeed"
                component={AddFeed}
                options={{
                  headerTitle: 'Create a Feed',
                }}
              />
              <Stack.Screen
                name="FeedDetails"
                component={FeedDetails}
                options={{
                  headerTitle: 'Feed',
                  headerLeft: () => (
                    <HeaderButton iconName="chevron-back-outline" />
                  ),
                }}
              />
              <Stack.Screen
                name="CommentDetails"
                component={CommentsDetails}
                options={{
                  presentation: 'modal',
                  animation: 'default',
                  headerTitle: 'Comment',
                  headerLeft: () => (
                    <HeaderButton iconName="chevron-back-outline" />
                  ),
                }}
              />
              <Stack.Screen
                name="MyPosts"
                component={MyPosts}
                options={{
                  headerTitle: 'My Posts',
                }}
              />
              <Stack.Screen
                name="MyComments"
                component={MyComments}
                options={{
                  headerTitle: 'My Comments',
                }}
              />
            </Stack.Group>
          </>
        )}
      </Stack.Group>
    </Stack.Navigator>
  );
};