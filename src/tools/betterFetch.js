/**
 * A `fetch` wrapper that makes fetch simpler
 * @param {string} url url
 * @param {object?} option `fetch` options
 * @param {boolean} allowElectron whether allow electron to handle the request
 * @param {string?} targetType target content type, use '' to auto detect
 * @returns {Promise<object|string>} response data or response object when error
 */
export default async (url, option = {}, allowElectron = false, targetType = '') => {
    if (process.env.NODE_ENV === 'test') {
        console.warn(`Request to ${url} is ignored while testing.`);
        return Promise.resolve();
    }
    if (allowElectron && window.__UOMA_ELECTRON__ && window.__UOMA_ELECTRON_BRIDGE__) {
        return window.__UOMA_ELECTRON_BRIDGE__.fetch(url.substr(18), option.body);
    }
    const response = await fetch(url, option);
    if (response.ok && response.status === 200) {
        if (targetType !== '') {
            return response[targetType]();
        }
        if (response.headers.get('Content-Type').indexOf('/json') !== -1) {
            return response.json();
        }
        if (response.headers.get('Content-Type').indexOf('image/') !== -1) {
            return response.blob();
        }
        return response.text();
    }
    return response;
};
