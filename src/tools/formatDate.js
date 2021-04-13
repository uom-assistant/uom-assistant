import localeList from '../locales/localeList';

/**
 * Format date based on locale
 * @param {Date} date Date object
 * @param {string} locale locale name
 * @returns {string} formated date string
 */
const formatDate = (date, locale, week = true) => {
    const localeDetail = localeList.find((item) => item.locale === locale);
    const yr = new Intl.DateTimeFormat(localeDetail.iso, { year: 'numeric' }).format(date);
    const mo = new Intl.DateTimeFormat(localeDetail.iso, { month: 'short' }).format(date);
    const da = new Intl.DateTimeFormat(localeDetail.iso, { day: 'numeric' }).format(date);
    const wd = new Intl.DateTimeFormat(localeDetail.iso, { weekday: 'long' }).format(date);
    if (week) {
        return localeDetail.timeFormatWeek(mo, da, wd);
    }
    const moNum = new Intl.DateTimeFormat(localeDetail.iso, { month: 'numeric' }).format(date);
    return localeDetail.timeFormat(yr, moNum, da);
};

export default formatDate;
