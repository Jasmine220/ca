import { ResultError } from "../result";

export interface ErrorData {
    errorCode: string;
    description: {
        en: string;
        vi: string;
    };
}

export class HttpError extends Error {
    constructor(public error: ResultError) {
        super();
        this.error = error;
    }
}
