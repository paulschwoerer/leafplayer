import { ButtonPrimary, ButtonText } from 'components/form/Button/Button';
import FormCard from 'components/form/FormCard/FormCard';
import Input from 'components/form/Input/Input';
import { useFormik } from 'formik';
import { RegisterRequestDto } from 'leafplayer-common';
import { isApiError, makeApiPostRequest } from 'modules/api';
import React, { ReactElement, useState } from 'react';
import { useHistory } from 'react-router-dom';

function Register(): ReactElement {
  const history = useHistory();

  const [error, setError] = useState('');

  const formik = useFormik({
    initialValues: {
      username: '',
      displayName: '',
      password: '',
      passwordRepeat: '',
      inviteCode: '',
    },

    validate: values => {
      const errors: { [key: string]: string } = {};

      if (!values.inviteCode) {
        errors.inviteCode = 'Required';
      }

      if (!values.username) {
        errors.username = 'Required';
      }

      if (!values.password) {
        errors.password = 'Required';
      }

      if (
        values.password.length > 0 &&
        values.passwordRepeat !== values.password
      ) {
        errors.passwordRepeat = 'Passwords do not match';
      }

      return errors;
    },

    onSubmit: async values => {
      const { username, password, inviteCode, displayName } = values;

      setError('');

      const result = await makeApiPostRequest<'', RegisterRequestDto>(
        'auth/register',
        {
          username,
          password,
          inviteCode,
          displayName,
        },
      );

      if (isApiError(result)) {
        setError(result.error);
      } else {
        history.push('/login');
      }
    },
  });

  function renderActions(): ReactElement {
    return (
      <>
        <ButtonPrimary type="submit">Create Account</ButtonPrimary>
        <ButtonText to="/login">Login instead</ButtonText>
      </>
    );
  }

  return (
    <div>
      <FormCard
        error={error}
        onCloseError={() => setError('')}
        actions={renderActions()}
        onSubmit={formik.handleSubmit}
      >
        <Input
          type="text"
          label="Invite Code"
          name="inviteCode"
          value={formik.values.inviteCode}
          onBlur={formik.handleBlur}
          onInput={formik.handleChange}
          error={formik.touched.inviteCode && formik.errors.inviteCode}
        />

        <Input
          type="text"
          label="Username"
          name="username"
          autoComplete="username"
          value={formik.values.username}
          onBlur={formik.handleBlur}
          onInput={formik.handleChange}
          error={formik.touched.username && formik.errors.username}
        />

        <Input
          type="text"
          label="Display Name"
          name="displayName"
          value={formik.values.displayName || formik.values.username}
          onBlur={formik.handleBlur}
          onInput={formik.handleChange}
          error={formik.touched.displayName && formik.errors.displayName}
        />

        <Input
          type="password"
          label="Password"
          name="password"
          value={formik.values.password}
          onBlur={formik.handleBlur}
          onInput={formik.handleChange}
          error={formik.touched.password && formik.errors.password}
        />

        <Input
          type="password"
          label="Repeat Password"
          name="passwordRepeat"
          value={formik.values.passwordRepeat}
          onBlur={formik.handleBlur}
          onInput={formik.handleChange}
          error={formik.touched.passwordRepeat && formik.errors.passwordRepeat}
        />
      </FormCard>
    </div>
  );
}

export default Register;
