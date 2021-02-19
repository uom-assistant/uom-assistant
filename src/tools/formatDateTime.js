/**
 * Format date time based on locale
 * @param {Date} date Date object
 * @param {string} locale locale for `Intl.DateTimeFormat()`
 * @param {boolean?} seconds whether to contain seconds
 * @returns {string} formated date time string
 */
const formatDateTime = (date, locale, seconds = true) => {
    const pad = (num) => (num < 10 ? `0${num}` : `${num}`);

    const yr = new Intl.DateTimeFormat(locale, { year: 'numeric' }).format(date);
    const mo = new Intl.DateTimeFormat(locale, { month: 'numeric' }).format(date);
    const da = new Intl.DateTimeFormat(locale, { day: 'numeric' }).format(date);
    const hr = pad(date.getHours());
    const mi = pad(date.getMinutes());
    const sc = pad(date.getSeconds());
    if (locale === 'zh') {
        return `${yr}${mo}${da} ${hr}:${mi}${seconds ? `:${sc}` : ''}`;
    }
    return `${da}/${mo}/${yr} ${hr}:${mi}${seconds ? `:${sc}` : ''}`;
};

export default formatDateTime;
