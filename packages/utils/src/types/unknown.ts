export function isNullOrUndefined(test: unknown): boolean {
    return typeof test === "undefined" || test === null
}