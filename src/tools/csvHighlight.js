// eslint-disable-next-line no-unused-vars
function csv(hljs) {
    return {
        name: 'CSV',
        case_insensitive: true,
        keywords: [],
        aliases: ['csv'],
        contains: [
            {
                scope: 'string',
                className: 'string',
                begin: /[^\r\n,"]+|"(?:[^"]|"")*"(?!")/,
            },
        ],
    };
}

module.exports = csv;
