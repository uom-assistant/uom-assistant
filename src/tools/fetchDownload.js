/**
 * Use fetch to download a file with progress monitor
 * @param {string} url url
 * @param {object?} option `fetch` options
 * @param {Function} callback callback function when progress updated
 * @returns {Promise<object|string>} response data or response object when error
 */
export default async (url, option = {}, callback) => {
    const response = await fetch(url, option);
    const reader = response.body.getReader();

    let receivedLength = 0;
    const chunks = [];
    // eslint-disable-next-line no-constant-condition
    while (true) {
        // eslint-disable-next-line no-await-in-loop
        const { done, value } = await reader.read();

        if (done) {
            break;
        }

        chunks.push(value);
        receivedLength += value.length;
        callback(receivedLength);
    }

    const chunksAll = new Uint8Array(receivedLength);
    let position = 0;
    for (const chunk of chunks) {
        chunksAll.set(chunk, position);
        position += chunk.length;
    }

    return new Blob([chunksAll]);
};
