import { NextFunction, Request, Response } from "express";
import { ValidationError, validationResult } from "express-validator";
import { HttpStatus } from "../constant/status";
import { ResultError } from "../result";
import { Middleware } from "./common";

const handleValidation: Middleware = (
    req: Request,
    _: Response,
    next: NextFunction
): void => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
        const validationErrors = error.array().map((e) => {
            const error: Partial<ValidationError> = e;
            const message = e.msg;
            delete error["msg"];
            return { message, ...error };
        });
        const resultError: ResultError = {
            status: HttpStatus.BAD_REQUEST,
            errors: validationErrors,
            code: "INVALID_DATA",
        };
        return next(resultError);
    } else {
        next();
    }
};

export default handleValidation;
