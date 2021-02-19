export default [
    {
        url: 'https://test.com/check_ability/',
        method: 'get',
        status: 200,
        headers: {
            'X-UOMA-TOKEN': '00000000000000000000000000000000',
        },
        response: {
            success: true,
            uomabVersion: '0.1.0',
            maintenance: false,
            data: {
                tokenRequired: false,
                allowAccount: true,
                allowSync: true,
                allowEmail: true,
                welcomeMessage: '',
            },
        },
        after: 1000,
    },
    {
        url: 'https://test.com/check_ability/',
        method: 'get',
        status: 200,
        headers: {},
        response: {
            success: true,
            uomabVersion: '0.1.0',
            maintenance: false,
            data: {
                tokenRequired: true,
            },
        },
        after: 1000,
    },
    {
        url: 'https://test2.com/check_ability/',
        method: 'get',
        status: 200,
        headers: {},
        response: {
            success: true,
            uomabVersion: '0.1.0',
            maintenance: false,
            data: {
                tokenRequired: false,
                welcomeMessage: 'Welcome!',
                allowAccount: false,
                allowSync: true,
                allowEmail: false,
            },
        },
        after: 1000,
    },
    {
        url: 'https://test3.com/check_ability/',
        method: 'get',
        status: 200,
        headers: {},
        response: {
            success: true,
            uomabVersion: '0.1.0',
            maintenance: true,
            data: {
                tokenRequired: true,
            },
        },
        after: 1000,
    },
    {
        url: 'https://dev.axton.cc:1737/check_ability/',
        method: 'get',
        status: 200,
        headers: {},
        response: {
            success: true,
            uomabVersion: '0.1.0',
            maintenance: false,
            data: {
                tokenRequired: false,
                allowAccount: true,
                allowSync: true,
                allowEmail: true,
            },
        },
        after: 1000,
    },
    {
        url: 'https://dev.axton.cc:1737/attendance/',
        method: 'post',
        status: 200,
        headers: {},
        response: {
            success: true,
            uomabVersion: '0.1.0',
            maintenance: false,
            data: {
                lastMonth: '100',
                annual: '95',
                absentRecord: [
                    {
                        name: 'Workshop-week1',
                        subject: 'COMP16412',
                        date: '2021-02-09',
                    },
                    {
                        name: 'Sem2 Week 1',
                        subject: 'COMP10120',
                        date: '2021-02-12',
                    },
                ],
            },
        },
        after: 1000,
    },
];
