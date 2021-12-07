import localeList from '../locales/localeList';

/**
 * Format date time based on locale
 * @param {Date} date Date object
 * @param {string} locale locale name
 * @param {boolean?} seconds whether to contain seconds
 * @param {boolean | string?} year whether to force contain year. Could be true, false or 'auto'
 * @returns {string} formated date time string
 */
const formatDateTime = (date, locale, timeFormatters, seconds = true, year = 'auto') => {
    const localeDetail = localeList.find((item) => item.locale === locale);
    const hasYear = date.getFullYear() !== new Date().getFullYear();
    let yr = '';
    const formattedDate = timeFormatters.time.formatToParts(date);
    if ((hasYear && year === 'auto') || year === true) {
        yr = formattedDate.find((item) => item.type === 'year').value;
    }
    const mo = formattedDate.find((item) => item.type === 'month').value;
    const da = formattedDate.find((item) => item.type === 'day').value;
    const hr = `${date.getHours()}`.padStart(2, '0');
    const mi = `${date.getMinutes()}`.padStart(2, '0');
    const sc = `${date.getSeconds()}`.padStart(2, '0');
    if (seconds) {
        return (hasYear && year === 'auto') || year === true ? localeDetail.timeFormatTimeSecond(yr, mo, da, hr, mi, sc) : localeDetail.timeFormatTimeSecondWithoutYear(mo, da, hr, mi, sc);
    }
    return (hasYear && year === 'auto') || year === true ? localeDetail.timeFormatTime(yr, mo, da, hr, mi) : localeDetail.timeFormatTimeWithoutYear(mo, da, hr, mi);
};

export default formatDateTime;
