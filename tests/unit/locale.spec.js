import locales from '@/locales/localeList';

describe('localeList', () => {
    it('should have more than 1 item', () => {
        expect(locales.length).toBeGreaterThanOrEqual(2);
    });

    it('should have correct attrs', () => {
        for (const item of locales) {
            expect(item).toHaveProperty('name');
            expect(typeof item.name).toMatch('string');

            expect(item).toHaveProperty('locale');
            expect(typeof item.locale).toMatch('string');

            expect(item).toHaveProperty('localeName');
            expect(typeof item.localeName).toMatch('string');

            expect(item).toHaveProperty('iso');
            expect(typeof item.iso).toMatch('string');

            expect(item).toHaveProperty('iso3');
            expect(typeof item.iso3).toMatch('string');

            expect(item).toHaveProperty('direction');
            expect(item.direction === 'ltr' || item.direction === 'rtl').toBe(true);

            expect(item).toHaveProperty('timeFormat');
            expect(typeof item.timeFormat).toMatch('function');
            expect(typeof item.timeFormat('', '', '')).toMatch('string');

            expect(item).toHaveProperty('timeFormatTime');
            expect(typeof item.timeFormatTime).toMatch('function');
            expect(typeof item.timeFormatTime('', '', '', '', '')).toMatch('string');

            expect(item).toHaveProperty('timeFormatTimeSecond');
            expect(typeof item.timeFormatTimeSecond).toMatch('function');
            expect(typeof item.timeFormatTimeSecond('', '', '', '', '', '')).toMatch('string');

            expect(item).toHaveProperty('timeFormatWeek');
            expect(typeof item.timeFormatWeek).toMatch('function');
            expect(typeof item.timeFormatWeek('', '', '')).toMatch('string');
        }
    });
});
