export default [
    {
        name: 'English (UK)',
        locale: 'en',
        localeName: 'en',
        iso: 'en',
        iso3: 'eng',
        direction: 'ltr',
        timeFormat: (yr, mo, da) => `${da}/${mo}/${yr}`,
        timeFormatTime: (yr, mo, da, hr, mi) => `${da}/${mo}/${yr} ${hr}:${mi}`,
        timeFormatTimeSecond: (yr, mo, da, hr, mi, sc) => `${da}/${mo}/${yr} ${hr}:${mi}:${sc}`,
        timeFormatTimeWithoutYear: (mo, da, hr, mi) => `${da}/${mo} ${hr}:${mi}`,
        timeFormatTimeSecondWithoutYear: (mo, da, hr, mi, sc) => `${da}/${mo} ${hr}:${mi}:${sc}`,
        timeFormatWeek: (mo, da, wd) => `${wd}, ${da} ${mo}`,
    },
    {
        name: '中文（简体）',
        locale: 'zh',
        localeName: 'zhHans',
        iso: 'zh-CN',
        iso3: 'cmn',
        direction: 'ltr',
        timeFormat: (yr, mo, da) => `${yr}年${mo}月${da}日`,
        timeFormatTime: (yr, mo, da, hr, mi) => `${yr}年${mo}月${da}日 ${hr}:${mi}`,
        timeFormatTimeSecond: (yr, mo, da, hr, mi, sc) => `${yr}年${mo}月${da}日 ${hr}:${mi}:${sc}`,
        timeFormatTimeWithoutYear: (mo, da, hr, mi) => `${mo}月${da}日 ${hr}:${mi}`,
        timeFormatTimeSecondWithoutYear: (mo, da, hr, mi, sc) => `${mo}月${da}日 ${hr}:${mi}:${sc}`,
        timeFormatWeek: (mo, da, wd) => `${mo}月${da}日，${wd}`,
    },
    {
        name: 'Español',
        locale: 'es',
        localeName: 'es',
        iso: 'es',
        iso3: 'spa',
        direction: 'ltr',
        timeFormat: (yr, mo, da) => `${da}/${mo}/${yr}`,
        timeFormatTime: (yr, mo, da, hr, mi) => `${da}/${mo}/${yr} ${hr}:${mi}`,
        timeFormatTimeSecond: (yr, mo, da, hr, mi, sc) => `${da}/${mo}/${yr} ${hr}:${mi}:${sc}`,
        timeFormatTimeWithoutYear: (mo, da, hr, mi) => `${da}/${mo} ${hr}:${mi}`,
        timeFormatTimeSecondWithoutYear: (mo, da, hr, mi, sc) => `${da}/${mo} ${hr}:${mi}:${sc}`,
        timeFormatWeek: (mo, da, wd) => `${wd}, ${da} de ${mo}`,
    },
    {
        name: '日本語',
        locale: 'ja',
        localeName: 'ja',
        iso: 'ja',
        iso3: 'jpn',
        direction: 'ltr',
        timeFormat: (yr, mo, da) => `${yr}年${mo}月${da}日`,
        timeFormatTime: (yr, mo, da, hr, mi) => `${yr}年${mo}月${da}日 ${hr}:${mi}`,
        timeFormatTimeSecond: (yr, mo, da, hr, mi, sc) => `${yr}年${mo}月${da}日 ${hr}:${mi}:${sc}`,
        timeFormatTimeWithoutYear: (mo, da, hr, mi) => `${mo}月${da}日 ${hr}:${mi}`,
        timeFormatTimeSecondWithoutYear: (mo, da, hr, mi, sc) => `${mo}月${da}日 ${hr}:${mi}:${sc}`,
        timeFormatWeek: (mo, da, wd) => `${mo}月${da}日，${wd}`,
    },
];
