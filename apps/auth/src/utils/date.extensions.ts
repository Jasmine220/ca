export {};

declare global {
    interface Date {
        addDays(days: number): Date;
    }
}

Date.prototype.addDays = function (days: number): Date {
    if (!days) {
        return this as Date;
    }
    const date = this as Date;
    date.setDate(date.getDate() + days);
    return date;
};
