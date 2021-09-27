if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line global-require, import/no-extraneous-dependencies
    const fetchMock = require('fetch-mock/es5/client');
    // eslint-disable-next-line global-require
    const config = require('./mock_config');

    fetchMock.config.fallbackToNetwork = true;

    for (const item of config.default) {
        if (item.method === 'get' || item.method === 'post') {
            fetchMock[item.method](item.url, {
                body: typeof item.response === 'string' ? item.response : JSON.stringify(item.response),
                status: item.status,
                headers: {
                    'Content-Type': typeof item.response === 'string' ? 'text/html; charset=utf-8' : 'application/json',
                },
            }, {
                delay: item.after,
                headers: item.headers,
                overwriteRoutes: false,
            });
        }
    }
}
