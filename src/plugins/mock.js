if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line global-require, import/no-extraneous-dependencies
    const fetchMock = require('fetch-mock/es5/client');
    // eslint-disable-next-line global-require
    const config = require('./mock_config');

    fetchMock.config.fallbackToNetwork = true;

    for (const item of config.default) {
        if (item.method === 'get') {
            fetchMock.get(item.url, {
                body: JSON.stringify(item.response),
                status: item.status,
                headers: {
                    'Content-Type': 'application/json',
                },
            }, {
                delay: item.after,
                headers: item.headers,
                overwriteRoutes: false,
            });
        } else if (item.method === 'post') {
            fetchMock.post(item.url, {
                body: JSON.stringify(item.response),
                status: item.status,
                headers: {
                    'Content-Type': 'application/json',
                },
            }, {
                delay: item.after,
                headers: item.headers,
                overwriteRoutes: false,
            });
        }
    }
}
