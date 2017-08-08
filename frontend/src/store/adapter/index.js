import extend from 'extend';
import store from 'store/index';
import axios from 'axios';

/**
 * Adapter class to perform API requests.
 */
export default class {
    options = {
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        responseType: 'json',
    };

    /**
     * Shorthand method for making a GET request.
     *
     * @param action
     * @param options
     */
    get(action, options) {
        return this.request('get', action, null, options);
    }

    /**
     * Shorthand method for making a POST request.
     *
     * @param action
     * @param body
     * @param options
     */
    post(action, body, options) {
        return this.request('post', action, body, options);
    }

    /**
     * Shorthand method for making a GET request.
     *
     * @param action
     * @param body
     * @param options
     */
    put(action, body, options) {
        return this.request('put', action, body, options);
    }

    /**
     * Shorthand method for making a GET request.
     *
     * @param action
     * @param options
     */
    delete(action, options) {
        return this.request('delete', action, null, options);
    }

    /**
     * Make an API request with given data.
     *
     * @param method The http method to use.
     * @param action The endpoint to send the message to.
     * @param body The body to send with the request. Is ignored on GET requests.
     * @param options_ An object of optional options to send with the request.
     * @returns {Promise} Returns a promise, which on resolving returns the data received from the API.
     */
    request(method, action, body, options_) {
        const options = extend(true, {}, this.options, options_ || {});

        const base = store.state.config.api.base;

        return axios[method](`${base}${action}`, body === null ? options : body, options)
            .then(response => (response && response.data ? response.data : response))
            .catch((error) => {
                if (process.env.NODE_ENV !== 'production') {
                    console.warn('[Adapter] An error occurred while communicating with the API.',
                        error ? (error.response || error) : '(no data)');
                }

                return Promise.reject((error && error.response && error.response.data) ? error.response.data : error);
            });
    }
}
