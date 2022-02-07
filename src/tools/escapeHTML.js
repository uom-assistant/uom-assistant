/**
 * Escapes HTML special characters in a string
 * @param {string} html The string to escape
 * @returns {string} The escaped string
 */
export default (html) => {
    const div = document.createElement('div');
    div.innerText = html;
    return div.innerHTML;
};
