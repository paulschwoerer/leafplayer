import React from 'react';
import ReactDOM from 'react-dom';
import './assets/fonts/FiraSans-Regular.ttf';
import './index.scss';

function importBuildTarget() {
  if (process.env.REACT_APP_BUILD_TARGET === 'APP') {
    return import('./App');
  } else if (process.env.REACT_APP_BUILD_TARGET === 'PUBLIC_SHARE') {
    return import('./PublicShareApp');
  } else {
    return Promise.reject(
      new Error('No such build target: ' + process.env.REACT_APP_BUILD_TARGET),
    );
  }
}

void importBuildTarget().then(({ default: Environment }) => {
  ReactDOM.render(
    <React.StrictMode>
      <Environment />
    </React.StrictMode>,
    document.getElementById('root'),
  );
});
