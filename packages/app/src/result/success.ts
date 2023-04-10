import { Any } from "utils";
import { HttpStatus } from "../constant/status";
import { ResultSuccess } from "./result";

export const ok = (data: Any): ResultSuccess => {
    return { status: HttpStatus.OK, data: data };
};

export const created = (data: Any): ResultSuccess => {
    return { status: HttpStatus.CREATED, data: data };
};

export const noContent = (): ResultSuccess => {
    return { status: HttpStatus.NO_CONTENT, data: undefined };
};
