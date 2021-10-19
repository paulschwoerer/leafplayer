import { ErrorAlert, SuccessAlert } from 'components/Alert/Alert';
import { ButtonPrimary } from 'components/form/Button/Button';
import Input from 'components/form/Input/Input';
import { useFormik } from 'formik';
import { ChangePasswordRequestDto } from 'leafplayer-common';
import { isApiError, makeApiPostRequest } from 'modules/api';
import React, { ReactElement, useState } from 'react';

function PasswordChanging(): ReactElement {
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const formik = useFormik({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      passwordRepeat: '',
    },

    validate: values => {
      const errors: { [key: string]: string } = {};

      if (!values.currentPassword) {
        errors.inviteCode = 'Required';
      }

      if (!values.newPassword) {
        errors.username = 'Required';
      }

      if (!values.passwordRepeat) {
        errors.password = 'Required';
      }

      if (
        values.newPassword.length > 0 &&
        values.passwordRepeat !== values.newPassword
      ) {
        errors.passwordRepeat = 'Passwords do not match';
      }

      return errors;
    },

    onSubmit: async ({ currentPassword, newPassword }) => {
      setError('');
      setIsSuccess(false);

      const result = await makeApiPostRequest<never, ChangePasswordRequestDto>(
        'auth/password',
        {
          currentPassword,
          newPassword,
        },
      );

      if (isApiError(result)) {
        setError(result.message);
      } else {
        setIsSuccess(true);
      }
    },
  });

  return (
    <>
      <ErrorAlert message={error} onClose={() => setError('')} />

      {isSuccess && (
        <SuccessAlert
          message="You changed your password successfully"
          onClose={() => setIsSuccess(false)}
        />
      )}

      <form onSubmit={formik.handleSubmit}>
        <Input
          type="password"
          label="Current Password"
          name="currentPassword"
          value={formik.values.currentPassword}
          onBlur={formik.handleBlur}
          onInput={formik.handleChange}
          error={
            formik.touched.currentPassword && formik.errors.currentPassword
          }
        />

        <Input
          type="password"
          label="New Password"
          name="newPassword"
          value={formik.values.newPassword}
          onBlur={formik.handleBlur}
          onInput={formik.handleChange}
          error={formik.touched.newPassword && formik.errors.newPassword}
        />

        <Input
          type="password"
          label="Repeat New Password"
          name="passwordRepeat"
          value={formik.values.passwordRepeat}
          onBlur={formik.handleBlur}
          onInput={formik.handleChange}
          error={formik.touched.passwordRepeat && formik.errors.passwordRepeat}
        />

        <ButtonPrimary type="submit">Change Password</ButtonPrimary>
      </form>
    </>
  );
}

export default PasswordChanging;
