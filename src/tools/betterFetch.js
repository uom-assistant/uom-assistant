/**
 * A `fetch` wrapper that makes fetch simpler
 * @param {string} url url
 * @param {object?} option `fetch` options
 * @param {string?} targetType target content type, use '' to auto detect
 * @returns {Promise<object|string>} response data or response object when error
 */
export default async (url, option = {}, targetType = '') => {
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
