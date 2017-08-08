import alertify from 'alertify.js';

/**
 * Show a notification. Returns a promise which resolves, when the user clicks the notification.
 *
 * @param message
 * @param type Can either be success, log, or error
 */
export const showNotification = (message, type = 'log') => new Promise((resolve) => {
    alertify.logPosition('top right').closeLogOnClick(true)[type](message, event => resolve(event));
});

export const showFailNotification = message => showNotification(message, 'error');

export const showSuccessNotification = message => showNotification(message, 'success');
