/**
 * Parse a time value in seconds into a human readable form "H:m:s".
 * Optionally hides the seconds if not needed.
 * Optionally shows indicators for hours, minutes and seconds instead of colons.
 *
 * @param value
 * @param withIndicators
 * @param withSeconds
 * @returns {string}
 */
export const timeString = (value, withIndicators = false, withSeconds = true) => {
    const hours = Math.floor(value / 3600);
    const minutes = Math.floor(value / 60) % 60;
    const seconds = Math.floor(value % 60);

    const hourString = hours ? `${hours}${withIndicators ? 'h ' : ':'}` : '';
    const minuteString = `${((minutes / 10 < 1) && hours) ? '0' : ''}${minutes}${withIndicators ? 'm ' : ':'}`;
    const secondString = `${((seconds / 10 < 1)) ? '0' : ''}${seconds}${withIndicators ? 's ' : ''}`;

    return withSeconds ? `${hourString}${minuteString}${secondString}` : `${hourString}${minuteString}`;
};

/**
 * Timing function easeInOutQuad.
 *
 * @param value
 */
export const easeInOutQuad = value =>
    (value < 0.5 ? 2 * value * value : -1 + ((4 - (2 * value)) * value));

/**
 * Get a human readable time period.
 * For example 'a minute ago', 'two hours ago', ...
 *
 * @returns {*}
 * @param dateString
 */
export const getHumanReadableTimePeriod = (dateString) => {
    const date = new Date(Date.parse(dateString));
    const currentDate = new Date();

    // difference in milliseconds
    const timeDifference = currentDate.getTime() - date.getTime();

    // If less than one minute
    if (timeDifference < (60 * 1000)) {
        return 'just now';
    }

    // If less than an hour
    if (timeDifference < (3600 * 1000)) {
        const minutes = Math.floor(timeDifference / 1000 / 60);

        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    }

    // If less than a day
    if (timeDifference < (3600 * 24 * 1000)) {
        const hours = Math.floor(timeDifference / 1000 / 60 / 60);

        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    }

    // if less than three days ago
    if (timeDifference < (3600 * 24 * 3 * 1000)) {
        const days = Math.floor(timeDifference / 1000 / 60 / 60 / 24);

        return `${days} day${days > 1 ? 's' : ''} ago`;
    }

    const year = date.getFullYear() !== currentDate.getFullYear() ? `.${date.getFullYear()}` : '';
    const month = ((date.getMonth() + 1) / 10) < 1 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;

    return `on ${date.getDate()}.${month}${year}`;
};
