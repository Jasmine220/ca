import { NextFunction, Request, Response } from "express";
import logger from "logger";
import { v1 } from "uuid";
import { mask } from "../mask";

export const requestInitialization = (
    req: Request,
    _: Response,
    next: NextFunction
): void => {
    const requestTime = new Date();
    const requestId = v1();
    req.requestTime = requestTime;
    req.requestId = requestId;
    const { method, body, url } = req;
    const maskedBody = JSON.parse(JSON.stringify(body));
    mask(maskedBody, ["password", "accessToken", "refreshToken"]);
    const data = { requestId, requestTime, method, url, body: maskedBody };
    logger.info(JSON.stringify(data), { label: "REQUEST" });
    next();
};
