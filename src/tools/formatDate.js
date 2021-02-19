/**
 * Format date based on locale
 * @param {Date} date Date object
 * @param {string} locale locale for `Intl.DateTimeFormat()`
 * @returns {string} formated date string
 */
const formatDate = (date, locale, week = true) => {
    const yr = new Intl.DateTimeFormat(locale, { year: 'numeric' }).format(date);
    const mo = new Intl.DateTimeFormat(locale, { month: 'short' }).format(date);
    const da = new Intl.DateTimeFormat(locale, { day: 'numeric' }).format(date);
    const wd = new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(date);
    if (week) {
        if (locale === 'zh') {
            return `${mo}${da}，${wd}`;
        }
        return `${da} ${mo}, ${wd}`;
    }
    const moNum = new Intl.DateTimeFormat(locale, { month: 'numeric' }).format(date);
    if (locale === 'zh') {
        return `${yr}${moNum}${da}`;
    }
    return `${da}/${moNum}/${yr}`;
};

export default formatDate;
