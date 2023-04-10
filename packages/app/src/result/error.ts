import { Any } from "utils";
import { HttpStatus } from "../constant/status";
import { ResultError } from "./result";

export const actionNotAllowed = (): ResultError => {
    return {
        status: HttpStatus.UNAUTHORIZED,
        code: "ACTION_NOT_ALLOWED",
        errors: [
            {
                param: "token.role",
                location: "header",
            },
        ],
    };
};

export const methodNotAllowed = (method: string): ResultError => {
    return {
        status: HttpStatus.METHOD_NOT_ALLOWED,
        code: "METHOD_NOT_ALLOWED",
        errors: [
            {
                location: "method",
                value: method,
                message: `method not allowed`,
            },
        ],
    };
};

export const exception = (e: Error): ResultError => {
    let stack = e.stack?.split("\n");
    stack = stack?.map((s) => s.trim());
    return {
        status: HttpStatus.INTERNAL_SERVER,
        code: "INTERNAL_SERVER_ERROR",
        errors: [
            {
                location: e.name,
                message: e.message,
                value: stack,
            },
        ],
    };
};

export const syntax = (e: SyntaxError): ResultError => {
    return {
        status: HttpStatus.INTERNAL_SERVER,
        code: "BODY_JSON_SYNTAX",
        errors: [
            {
                location: "body",
                message: e.message,
            },
        ],
    };
};

export const service = (path: string): ResultError => {
    return {
        status: HttpStatus.INTERNAL_SERVER,
        code: "INTERNAL_SERVER_ERROR",
        errors: [
            {
                location: "url",
                value: path,
                message: "there was a problem with internal service",
            },
        ],
    };
};

export const invalidData = (params: {
    location?: string;
    param?: string;
    value?: Any;
    message?: string;
    description?: {
        en: string;
        vi: string;
    };
}): ResultError => {
    const _location = params.location || "body";
    return {
        status: HttpStatus.BAD_REQUEST,
        code: "INVALID_DATA",
        description: params.description,
        errors: [
            {
                location: _location,
                param: params.param,
                value: params.value,
                message: params.message,
            },
        ],
    };
};

export const urlNotFound = (path: string): ResultError => {
    return {
        status: HttpStatus.NOT_FOUND,
        code: "URL_NOT_FOUND",
        errors: [
            {
                location: "path",
                value: path,
                message: "the url was not found",
            },
        ],
    };
};

export const notFound = (params: {
    location?: string;
    param?: string;
    value?: Any;
    message?: string;
}): ResultError => {
    const _location = params.location || "param";
    const _param = params.param || "id";
    return {
        status: HttpStatus.NOT_FOUND,
        code: "NOT_FOUND",
        errors: [
            {
                location: _location,
                param: _param,
                value: params.value,
                message: params.message,
            },
        ],
    };
};

export const database = (): ResultError => {
    return {
        status: HttpStatus.INTERNAL_SERVER,
        code: "DATABASE_SERVER_ERROR",
    };
};
