import AuthForm from 'components/form/AuthForm/AuthForm';
import { ButtonPrimary } from 'components/form/Button/Button';
import Checkbox from 'components/form/Checkbox/Checkbox';
import Input from 'components/form/Input/Input';
import AppLink from 'components/layout/AppLink/AppLink';
import { useFormik } from 'formik';
import { AuthRequestDto, AuthResponseDto } from 'leafplayer-common';
import { isApiError, makeApiPostRequest } from 'modules/api';
import { AuthContext } from 'modules/auth';
import React, { ReactElement, useContext, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';

function Login({ history }: RouteComponentProps): ReactElement {
  const authContext = useContext(AuthContext);

  const [error, setError] = useState('');

  const formik = useFormik({
    initialValues: {
      username: '',
      password: '',
      stayLoggedIn: true,
    },

    validate: values => {
      const errors: { [key: string]: string } = {};

      if (!values.username) {
        errors.username = 'Required';
      }

      if (!values.password) {
        errors.password = 'Required';
      }

      return errors;
    },

    onSubmit: async values => {
      setError('');

      const result = await makeApiPostRequest<AuthResponseDto, AuthRequestDto>(
        'auth/login',
        values,
      );

      if (isApiError(result)) {
        setError(result.error);
      } else {
        authContext.storeUser(result.user);
        authContext.storeArtworkToken(result.artworkToken);
        history.replace('/');
      }
    },
  });

  function renderActions(): ReactElement {
    return (
      <>
        <AppLink to="/register">Create Account</AppLink>

        <ButtonPrimary type="submit">Login</ButtonPrimary>
      </>
    );
  }

  return (
    <>
      <AuthForm
        error={error}
        onCloseError={() => setError('')}
        actions={renderActions()}
        onSubmit={formik.handleSubmit}
      >
        <Input
          type="text"
          label="Username"
          name="username"
          value={formik.values.username}
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
          error={formik.touched.username && formik.errors.username}
        />

        <Input
          type="password"
          label="Password"
          name="password"
          value={formik.values.password}
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
          error={formik.touched.password && formik.errors.password}
        />

        <Checkbox
          name="stayLoggedIn"
          checked={formik.values.stayLoggedIn}
          onChange={formik.handleChange}
        >
          Stay logged in
        </Checkbox>
      </AuthForm>
    </>
  );
}

export default Login;
