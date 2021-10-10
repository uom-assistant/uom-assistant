export default [
    {
        url: 'https://test.com/check_ability/',
        method: 'post',
        status: 200,
        body: {
            token: '00000000000000000000000000000000',
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
        method: 'post',
        status: 200,
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
        method: 'post',
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
        method: 'post',
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
        url: 'https://test.com/check_account/',
        method: 'post',
        status: 200,
        headers: {},
        response: {
            success: true,
            uomabVersion: '0.1.0',
            maintenance: false,
            data: {
                login: true,
            },
        },
        after: 1000,
    },
    {
        url: 'path:/grade_attendance/',
        method: 'post',
        status: 200,
        headers: {},
        response: {
            success: true,
            uomabVersion: '0.1.0',
            maintenance: false,
            data: {
                grade: [
                    {
                        name: 'Semester 1',
                        data: [
                            {
                                subject: 'COMP10120',
                                name: 'First Year Team Project',
                                weightedGrade: '35',
                                detail: [
                                    [
                                        {
                                            rawName: '10120-Quiz1-F-Lab1',
                                            name: 'Quiz1-Lab1',
                                            summative: false,
                                            grade: '36',
                                            gradeAll: '36',
                                            time: '2020-12-16 17:00:00',
                                            late: false,
                                        },
                                        {
                                            rawName: '10120-Quiz2-F-Lab 2',
                                            name: 'Quiz2-Lab 2',
                                            summative: false,
                                            grade: '40',
                                            gradeAll: '40',
                                            time: '2020-12-16 17:00:00',
                                            late: false,
                                        },
                                        {
                                            rawName: '10120-Quiz3-F-Lab 3',
                                            name: 'Quiz3-Lab 3',
                                            summative: false,
                                            grade: '50',
                                            gradeAll: '50',
                                            time: '2020-12-16 17:00:00',
                                            late: false,
                                        },
                                        {
                                            rawName: '10120-Quiz4-F-Lab 4',
                                            name: 'Quiz4-Lab 4',
                                            summative: false,
                                            grade: '57',
                                            gradeAll: '60',
                                            time: '2020-12-16 17:00:00',
                                            late: false,
                                        },
                                        {
                                            rawName: '10120-Quiz5-F-Lab 5',
                                            name: 'Quiz5-Lab 5',
                                            summative: false,
                                            grade: '180',
                                            gradeAll: '180',
                                            time: '2020-12-16 17:00:00',
                                            late: false,
                                        },
                                    ],
                                    {
                                        rawName: '10120-presentation1-S-Sem 1 Presentation',
                                        name: 'presentation1-Sem 1 Presentation',
                                        summative: true,
                                        grade: '15',
                                        gradeAll: '18',
                                        time: '2020-12-16 18:00:00',
                                        late: false,
                                    },
                                    [
                                        {
                                            rawName: '10120-Quiz1-F-Lab1',
                                            name: 'Quiz1-Lab1',
                                            summative: false,
                                            grade: '36',
                                            gradeAll: '36',
                                            time: '2021-01-01 17:00:00',
                                            late: false,
                                        },
                                        {
                                            rawName: '10120-Quiz2-F-Lab 2',
                                            name: 'Quiz2-Lab 2',
                                            summative: false,
                                            grade: '40',
                                            gradeAll: '60',
                                            time: '2021-01-01 17:00:00',
                                            late: false,
                                        },
                                        {
                                            rawName: '10120-Quiz3-F-Lab 3',
                                            name: 'Quiz3-Lab 3',
                                            summative: false,
                                            grade: '50',
                                            gradeAll: '50',
                                            time: '2021-01-01 17:00:00',
                                            late: false,
                                        },
                                        {
                                            rawName: '10120-Quiz4-F-Lab 4',
                                            name: 'Quiz4-Lab 4',
                                            summative: false,
                                            grade: '57',
                                            gradeAll: '60',
                                            time: '2021-01-01 17:00:00',
                                            late: false,
                                        },
                                        {
                                            rawName: '10120-Quiz5-F-Lab 5',
                                            name: 'Quiz5-Lab 5',
                                            summative: false,
                                            grade: '180',
                                            gradeAll: '200',
                                            time: '2021-01-01 17:00:00',
                                            late: false,
                                        },
                                    ],
                                    {
                                        rawName: '10120-report-S-Reflective Report',
                                        name: 'report-Reflective Report',
                                        summative: true,
                                        grade: '9',
                                        gradeAll: '10',
                                        time: '2021-02-12 09:00:00',
                                        late: false,
                                    },
                                ],
                            },
                            {
                                subject: 'COMP13212',
                                name: 'Data Science',
                                weightedGrade: '10',
                                detail: [
                                    {
                                        rawName: '13212-TEST',
                                        name: 'TEST',
                                        summative: true,
                                        grade: '90',
                                        gradeAll: '100',
                                        time: '2020-12-16 18:00:00',
                                        late: false,
                                    },
                                ],
                            },
                            {
                                subject: 'COMP11120',
                                name: 'Mathematical Techniques for Computer Science',
                                weightedGrade: '48',
                                detail: [
                                    [
                                        {
                                            rawName: '11120-sheet00-F-Sheet 0',
                                            name: 'sheet00-Sheet 0',
                                            summative: false,
                                            grade: '4',
                                            gradeAll: '5',
                                            time: '2020-10-05 11:00:00',
                                            late: false,
                                        },
                                        {
                                            rawName: '11120-sheet01-S-Sheet 1',
                                            name: 'sheet01-Sheet 1',
                                            summative: true,
                                            grade: '5',
                                            gradeAll: '5',
                                            time: '2020-10-12 11:00:00',
                                            late: false,
                                        },
                                        {
                                            rawName: '11120-sheet02-S-Sheet 2',
                                            name: 'sheet02-Sheet 2',
                                            summative: true,
                                            grade: '5',
                                            gradeAll: '5',
                                            time: '2020-10-19 11:00:00',
                                            late: false,
                                        },
                                        {
                                            rawName: '11120-sheet03-S-Sheet 3',
                                            name: 'sheet03-Sheet 3',
                                            summative: true,
                                            grade: '2',
                                            gradeAll: '5',
                                            time: '2020-10-26 12:00:00',
                                            late: false,
                                        },
                                        {
                                            rawName: '11120-sheet04-S-Sheet 4',
                                            name: 'sheet04-Sheet 4',
                                            summative: true,
                                            grade: '3',
                                            gradeAll: '5',
                                            time: '2020-11-02 12:00:00',
                                            late: false,
                                        },
                                        {
                                            rawName: '11120-sheet05-S-Sheet 5',
                                            name: 'sheet05-Sheet 5',
                                            summative: true,
                                            grade: '3',
                                            gradeAll: '5',
                                            time: '2020-11-09 12:00:00',
                                            late: false,
                                        },
                                        {
                                            rawName: '11120-sheet06-S-Sheet 6',
                                            name: 'sheet06-Sheet 6',
                                            summative: true,
                                            grade: '4',
                                            gradeAll: '5',
                                            time: '2020-11-16 12:00:00',
                                            late: true,
                                        },
                                        {
                                            rawName: '11120-sheet07-S-Sheet 7',
                                            name: 'sheet07-Sheet 7',
                                            summative: true,
                                            grade: '5',
                                            gradeAll: '5',
                                            time: '2020-11-23 12:00:00',
                                            late: false,
                                        },
                                        {
                                            rawName: '11120-sheet08-S-Sheet 8',
                                            name: 'sheet08-Sheet 8',
                                            summative: true,
                                            grade: '4',
                                            gradeAll: '5',
                                            time: '2020-11-30 12:00:00',
                                            late: false,
                                        },
                                        {
                                            rawName: '11120-sheet09-S-Sheet 9',
                                            name: 'sheet09-Sheet 9',
                                            summative: true,
                                            grade: '4',
                                            gradeAll: '5',
                                            time: '2020-12-07 12:00:00',
                                            late: true,
                                        },
                                        {
                                            rawName: '11120-sheet10-S-Sheet 10',
                                            name: 'sheet10-Sheet 10',
                                            summative: true,
                                            grade: '5',
                                            gradeAll: '5',
                                            time: '2020-12-14 12:00:00',
                                            late: false,
                                        },
                                    ],
                                ],
                            },
                            {
                                subject: 'COMP15212',
                                name: 'Operating Systems',
                                weightedGrade: '0',
                                detail: [],
                            },
                        ],
                    },
                    {
                        name: 'Semester 2',
                        data: [
                            {
                                subject: 'COMP13213',
                                name: 'Data Science 2',
                                weightedGrade: '10',
                                detail: [
                                    {
                                        rawName: '13213-TEST',
                                        name: 'TEST',
                                        summative: true,
                                        grade: '90',
                                        gradeAll: '100',
                                        time: '2020-12-18 18:00:00',
                                        late: false,
                                    },
                                ],
                            },
                            {
                                subject: 'COMP15214',
                                name: 'Operating Systems 3',
                                weightedGrade: '0',
                                detail: [],
                            },
                        ],
                    },
                ],
                attendance: {
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
        },
        after: 2500,
    },
    {
        url: 'path:/mail/send/',
        method: 'post',
        status: 200,
        headers: {},
        response: {
            success: true,
            uomabVersion: '0.1.0',
            maintenance: false,
            data: [],
        },
        after: 10000,
    },
    {
        url: 'path:/mail/list/',
        method: 'post',
        status: 200,
        headers: {},
        response: {
            success: true,
            uomabVersion: '0.1.0',
            maintenance: false,
            data: [
                {
                    subject: '[CompSci] The Monday Mail - Week Z',
                    from: false,
                    fromAddress: 'O.Ppppp@manchester.ac.uk',
                    replyTo: false,
                    replyToAddress: 'O.Ppppp@manchester.ac.uk',
                    to: [
                        {
                            name: false,
                            address: 'test.test@manchester.ac.uk',
                        },
                    ],
                    cc: [],
                    id: 90,
                    messageId: '<test@hhh.cs.man.ac.uk>',
                    date: 1613981814,
                    flagged: false,
                    unseen: false,
                },
                {
                    subject: 'COMP11212 Fundamentals of Computation 2077-78 2nd Semester: Week X Activities',
                    from: 'Lllll Mmmmm - lllll.mmmmm@manchester.ac.uk',
                    fromAddress: 'do-not-reply@blackboard.com',
                    replyTo: 'Lllll Mmmmm - lllll.mmmmm@manchester.ac.uk',
                    replyToAddress: 'lllll.mmmmm@manchester.ac.uk',
                    to: [],
                    cc: [],
                    id: 92,
                    messageId: '<test.test5@test.test>',
                    date: 1613982016,
                    flagged: false,
                    unseen: false,
                },
                {
                    subject: 'Submission received',
                    from: false,
                    fromAddress: 'do-not-reply@blackboard.com',
                    replyTo: false,
                    replyToAddress: 'elearning@manchester.ac.uk',
                    to: [
                        {
                            name: false,
                            address: 'test.test@manchester.ac.uk',
                        },
                    ],
                    cc: [],
                    id: 94,
                    messageId: '<test.test4@test.test>',
                    date: 1613993764,
                    flagged: false,
                    unseen: false,
                },
                {
                    subject: false,
                    from: 'Jjjjj Kkkkk',
                    fromAddress: 'jjjjj.kkkkk-2@manchester.ac.uk',
                    replyTo: false,
                    replyToAddress: false,
                    to: [
                        {
                            name: 'Test test',
                            address: 'test.test@manchester.ac.uk',
                        },
                    ],
                    cc: [],
                    id: 267,
                    messageId: '<hhhhh@PROD.OUTLOOK.COM>',
                    date: 1614884503,
                    flagged: true,
                    unseen: false,
                },
                {
                    subject: 'Teams Mail',
                    from: 'Someone in Teams',
                    fromAddress: 'noreply@email.teams.microsoft.com',
                    replyTo: false,
                    replyToAddress: false,
                    to: [
                        {
                            name: 'Test test',
                            address: 'test.test@manchester.ac.uk',
                        },
                    ],
                    cc: [],
                    id: 268,
                    messageId: '<hhhhh2@PROD.OUTLOOK.COM>',
                    date: 1614884543,
                    flagged: false,
                    unseen: false,
                },
                {
                    subject: 'My Manchester News',
                    from: 'My Manchester News',
                    fromAddress: 'studentnews@emarketing.manchester.ac.uk',
                    replyTo: false,
                    replyToAddress: false,
                    to: [
                        {
                            name: 'Test test',
                            address: 'test.test@manchester.ac.uk',
                        },
                    ],
                    cc: [],
                    id: 269,
                    messageId: '<hhhhh3@PROD.OUTLOOK.COM>',
                    date: 1614885543,
                    flagged: false,
                    unseen: false,
                },
                {
                    subject: 'Why can\'t it be something?',
                    from: 'I 23333-COMP-13212-34444 on Piazza',
                    fromAddress: 'no-reply@piazza.com',
                    replyTo: false,
                    replyToAddress: false,
                    to: [
                        {
                            name: false,
                            address: 'test.test3test.test3test.test3test.test3test.test3test.test3@manchester.ac.uk',
                        },
                        {
                            name: 'Test test',
                            address: 'test.test2@manchester.ac.uk',
                        },
                        {
                            name: false,
                            address: 'test.test3@manchester.ac.uk',
                        },
                    ],
                    cc: [
                        {
                            name: 'testtest2@someaddr.manchester.ac.uk',
                            address: 'testtest2@someaddr.manchester.ac.uk',
                        },
                    ],
                    id: 270,
                    messageId: '<klvkpkq8cn@biazza.com>',
                    date: 1614903893,
                    flagged: false,
                    unseen: true,
                },
                {
                    subject: '[SOMETHING] Some event Today',
                    from: 'Ggggg Hhhhh Iiiii',
                    fromAddress: 'ggggg.hhhhhiiiii@manchester.ac.uk',
                    replyTo: 'Ggggg Hhhhh Iiiii',
                    replyToAddress: 'ggggg.hhhhhiiiii@manchester.ac.uk',
                    to: [
                        {
                            name: 'testtest@someaddr.manchester.ac.uk',
                            address: 'testtest@someaddr.manchester.ac.uk',
                        },
                    ],
                    cc: [
                        {
                            name: 'testtest2@someaddr.manchester.ac.uk',
                            address: 'testtest2@someaddr.manchester.ac.uk',
                        },
                    ],
                    id: 279,
                    messageId: '<2333@PROD.OUTLOOK.COM>',
                    date: 1614936196,
                    flagged: false,
                    unseen: false,
                },
                {
                    subject: 'COMP13212 Data Science 2077-78 2nd Semester: Hi there',
                    from: 'Eeeee Fffff - eeeee.fffff@manchester.ac.uk',
                    fromAddress: 'do-not-reply@blackboard.com',
                    replyTo: 'Eeeee Fffff - eeeee.fffff@manchester.ac.uk',
                    replyToAddress: 'eeeee.fffff@manchester.ac.uk',
                    to: [],
                    cc: [],
                    id: 281,
                    messageId: '<test.test3@test.test>',
                    date: 1614941395,
                    flagged: false,
                    unseen: false,
                },
                {
                    subject: 'COMP16412 Programming 2 2077-78 2nd Semester',
                    from: 'Ccccc Ddddd - ccccc.ddddd@manchester.ac.uk',
                    fromAddress: 'do-not-reply@blackboard.com',
                    replyTo: 'Ccccc Ddddd - ccccc.ddddd@manchester.ac.uk',
                    replyToAddress: 'ccccc.ddddd@manchester.ac.uk',
                    to: [],
                    cc: [],
                    id: 289,
                    messageId: '<test.test2@test.test>',
                    date: 1614945516,
                    flagged: false,
                    unseen: false,
                },
                {
                    subject: 'COMP15212 Programming 2 2077-78 2nd Semester: Week N Materials for COMP16412 now available',
                    from: 'Aaaaa Bbbbb - aaaaa.bbbbb@manchester.ac.uk',
                    fromAddress: 'do-not-reply@blackboard.com',
                    replyTo: 'Aaaaa Bbbbb - aaaaa.bbbbb@manchester.ac.uk',
                    replyToAddress: 'aaaaa.bbbbb@manchester.ac.uk',
                    to: [],
                    cc: [],
                    id: 292,
                    messageId: '<test.test1@test.test>',
                    date: 1614948560,
                    flagged: false,
                    unseen: true,
                },
                {
                    subject: 'COMP11120 Mathematical Techniques for Computer Science 2020-21 Full Year: COMP111 this week',
                    from: 'Aaaaa Ccccc',
                    fromAddress: 'aaaaa.cccccc@hotmail.com',
                    replyTo: 'Aaaaa Ccccc',
                    replyToAddress: 'aaaaa.cccccc@hotmail.com',
                    to: [],
                    cc: [],
                    id: 295,
                    messageId: '<test.test1@test.test>',
                    date: 1614948760,
                    flagged: false,
                    unseen: false,
                },
            ],
        },
        after: 3000,
    },
    {
        url: 'path:/mail/body/',
        method: 'post',
        status: 200,
        headers: {},
        response: {
            success: true,
            uomabVersion: '0.1.0',
            maintenance: false,
            data: {
                id: 292,
                attachments: [['test.pdf', 3840], ['test2.vue', 3840], ['Dockerfile', 3840], ['hi.zip', 3840], ['unknow.something', 3840]],
                content: '<div>hhh</div><p>testest</p>   \n\n\n\n       <style>p{color:red}</style><p>testest</p><p>testest <a href="https://github.com">GitHub</a></p><img src="https://www.bing.com/th?id=OHR.HinterseeRamsau_ROW5331031469_1920x1080.jpg&rf=LaDigue_1920x1080.jpg"><p>Lorem ipsum dolor sit amet, eu duo noster maluisset incorrupte, zril dolor ex est. Doming vocibus accusamus sed te. Ea aperiam theophrastus eos, soluta integre at vim, ex diceret aliquando voluptatum vel. Eam cu error eripuit dolorum. Per vero tractatos ad.</p>   <style>p{color:blue}</style>    <div style="width: 600px;">hhh</div>',
                plainContent: 'hhh\ntestest\ntestest\ntestest GitHub\nLorem ipsum dolor sit amet, eu duo noster maluisset incorrupte, zril dolor ex est. Doming vocibus accusamus sed te. Ea aperiam theophrastus eos, soluta integre at vim, ex diceret aliquando voluptatum vel. Eam cu error eripuit dolorum. Per vero tractatos ad.\nhhh',
                translator: 'deepl',
            },
        },
        after: 3000,
    },
    {
        url: 'path:/mail/attachment/',
        method: 'post',
        status: 200,
        headers: {},
        response: 'testttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestttestt',
        after: 3000,
    },
    {
        url: 'path:/mail/action/',
        method: 'post',
        status: 200,
        headers: {},
        response: {
            success: true,
            uomabVersion: '0.1.0',
            maintenance: false,
            data: {},
        },
        after: 3000,
    },
    {
        url: 'path:/mail/translate/',
        method: 'post',
        status: 200,
        headers: {},
        response: {
            success: true,
            uomabVersion: '0.1.0',
            maintenance: false,
            data: {
                id: 292,
                source: 'en',
                translatedSubject: 'COMP15212 编程 2 2077-78 第二学期。第N周 COMP16412的材料现已提供',
                translatedBody: '<div>哈哈哈</div><p>测试测试</p><p>测试测试</p><p>测试测试 <a href="https://github.com">GitHub</a></p><img src="https://www.bing.com/th?id=OHR.HinterseeRamsau_ROW5331031469_1920x1080.jpg&rf=LaDigue_1920x1080.jpg"><p>財舎必格孝岐訟済源会図囲級権会同城。児鬼突所高作界抗員設映臓酒賞映団図断民提。受美体方由消今木散背民職笑学育緩者。前寄度図軽果掲像対無貸目表旅。時固詳子稿葉稿就売甲賞引録結東色論山。美図全仕月紹守最助件音無性通出治。更転団情博局見康共咲徳飯惑検。</p><div style="width: 600px;">哈哈哈</div>',
            },
        },
        after: 3000,
    },
    {
        url: 'path:/mail/translator/',
        method: 'post',
        status: 200,
        headers: {},
        response: {
            success: true,
            uomabVersion: '0.1.0',
            maintenance: false,
            data: {
                translator: 'google',
            },
        },
        after: 500,
    },
];
