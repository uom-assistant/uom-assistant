/**
 * A `fetch` wrapper that makes fetch simpler
 * @param {string} url url
 * @param {object?} option `fetch` options
 * @returns {Promise<object|string>} response data or response object when error
 */
export default async (url, option = {}) => {
    const response = await fetch(url, option);
    if (response.ok && response.status === 200) {
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
