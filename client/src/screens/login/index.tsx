import type { RouteProp } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';
import React from 'react';

import { useLogin } from '@/api/auth/login';
import { useAuth } from '@/core';
import type { AuthStackParamList } from '@/navigation/auth-navigator';

import type { LoginFormProps } from './login-form';
import { LoginForm } from './login-form';

type Props = RouteProp<AuthStackParamList, 'Login'>;

export const Login = () => {
  const { params } = useRoute<Props>();
  const verifyEmail = params?.verifyEmail;

  const { isLoading, error, mutateAsync: mutateLogin } = useLogin();

  const signIn = useAuth.use.signIn();

  const onSubmit: LoginFormProps['onSubmit'] = async (data) => {
    const token = await mutateLogin(data);

    signIn({ access: token.accessToken, refresh: token.refreshToken });
  };

  return (
    <LoginForm
      onSubmit={onSubmit}
      isLoading={isLoading}
      error={error}
      emailVerified={verifyEmail === 'success'}
    />
  );
};