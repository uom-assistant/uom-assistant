/**
 * Format date based on locale
 * @param {Date} date Date object
 * @param {string} locale locale name
 * @returns {string} formated date string
 */
const formatDate = (date, locale, week = true) => {
    const standardLocale = locale === 'zh' ? 'zh-CN' : 'en';
    const yr = new Intl.DateTimeFormat(standardLocale, { year: 'numeric' }).format(date);
    const mo = new Intl.DateTimeFormat(standardLocale, { month: 'short' }).format(date);
    const da = new Intl.DateTimeFormat(standardLocale, { day: 'numeric' }).format(date);
    const wd = new Intl.DateTimeFormat(standardLocale, { weekday: 'long' }).format(date);
    if (week) {
        if (locale === 'zh') {
            return `${mo}${da}，${wd}`;
        }
        return `${da} ${mo}, ${wd}`;
    }
    const moNum = new Intl.DateTimeFormat(standardLocale, { month: 'numeric' }).format(date);
    if (locale === 'zh') {
        return `${yr}${moNum}${da}`;
    }
    return `${da}/${moNum}/${yr}`;
};

export default formatDate;
