import { HttpStatus } from "../constant/status";
import { Any } from "utils";

export interface ResultSuccess {
    status: HttpStatus;
    data: Any;
}

export interface ResultError {
    status: HttpStatus;
    code?: string;
    description?: {
        vi: string;
        en: string;
    };
    errors?: ErrorDetail[];
    details?: Any;
}

export interface ErrorDetail {
    location?: string;
    value?: Any;
    param?: string;
    message?: string;
}

export type Result = ResultSuccess | ResultError;
