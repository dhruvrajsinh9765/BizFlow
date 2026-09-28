const isValidDateOnly = (dateString) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return false;
    }

    const [year, month, day] = dateString
        .split("-")
        .map(Number);

    const date = new Date(Date.UTC(year, month - 1, day));

    return (
        date.getUTCFullYear() === year &&
        date.getUTCMonth() === month - 1 &&
        date.getUTCDate() === day
    );
};


const getStartOfDayIST = (dateString) => {
    if (!isValidDateOnly(dateString)) {
        return null;
    }

    return new Date(`${dateString}T00:00:00+05:30`);
};


const getEndOfDayIST = (dateString) => {
    if (!isValidDateOnly(dateString)) {
        return null;
    }

    return new Date(`${dateString}T23:59:59.999+05:30`);
};


module.exports = {
    getStartOfDayIST,
    getEndOfDayIST
};