import localeList from '../locales/localeList';

/**
 * Format date time based on locale
 * @param {Date} date Date object
 * @param {string} locale locale name
 * @param {boolean?} seconds whether to contain seconds
 * @returns {string} formated date time string
 */
const formatDateTime = (date, locale, seconds = true) => {
    const localeDetail = localeList.find((item) => item.locale === locale);
    const yr = new Intl.DateTimeFormat(localeDetail.iso, { year: 'numeric' }).format(date);
    const mo = new Intl.DateTimeFormat(localeDetail.iso, { month: 'numeric' }).format(date);
    const da = new Intl.DateTimeFormat(localeDetail.iso, { day: 'numeric' }).format(date);
    const hr = `${date.getHours()}`.padStart(2, '0');
    const mi = `${date.getMinutes()}`.padStart(2, '0');
    const sc = `${date.getSeconds()}`.padStart(2, '0');
    if (seconds) {
        return localeDetail.timeFormatTimeSecond(yr, mo, da, hr, mi, sc);
    }
    return localeDetail.timeFormatTime(yr, mo, da, hr, mi);
};

export default formatDateTime;
