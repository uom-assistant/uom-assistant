import localeList from '../locales/localeList';

/**
 * Format date based on locale
 * @param {Date} date Date object
 * @param {string} locale locale name
 * @param {array} timeFormatters time formatter list
 * @param {boolean} week whether to format date with week
 * @param {boolean | string?} year whether to force contain year. Could be true, false or 'auto'
 * @returns {string} formated date string
 */
const formatDate = (date, locale, timeFormatters, week = true, year = false) => {
    const hasYear = date.getFullYear() !== new Date().getFullYear();
    const localeDetail = localeList.find((item) => item.locale === locale);
    const formattedDate = timeFormatters.date.formatToParts(date);
    const yr = formattedDate.find((item) => item.type === 'year').value;
    const mo = formattedDate.find((item) => item.type === 'month').value;
    const da = formattedDate.find((item) => item.type === 'day').value;
    const wd = formattedDate.find((item) => item.type === 'weekday').value;
    if (week) {
        return localeDetail.timeFormatWeek(mo, da, wd);
    }
    const moNum = timeFormatters.time.formatToParts(date).find((item) => item.type === 'month').value;
    return (hasYear && year === 'auto') || year === true ? localeDetail.timeFormat(yr, moNum, da) : localeDetail.timeFormatWithoutYear(moNum, da);
};

export default formatDate;
