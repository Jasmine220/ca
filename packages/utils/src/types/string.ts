import { Any } from "./any";

export const parse = Symbol();
export const isNumeric = Symbol();

function get(path: string, obj: Any, fb = `$\{${path}}`): string {
    return path.split(".").reduce((res, key) => res[key] || fb, obj);
}

function parseImpl(
    this: string,
    map: Record<string, unknown>,
    fallback?: string
): string {
    return this.replace(/\$\{.+?}/g, (match) => {
        const path = match.substring(2, match.length - 1).trim();
        return get(path, map, fallback);
    });
}

function isNumericImpl(this: string) {
    return !isNaN(parseInt(this)) && !isNaN(parseFloat(this))
}

declare global {
    interface String {
        [parse]: typeof parseImpl;
        [isNumeric]: typeof isNumericImpl
    }
}

String.prototype[parse] = parseImpl;
String.prototype[isNumeric] = isNumericImpl;

export { };
