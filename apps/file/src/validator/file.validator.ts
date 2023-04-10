import { handleValidation } from "app";
import { RequestHandler } from "express";
import { body, query, ValidationChain } from "express-validator";

export const createLinkValidator = (): (ValidationChain | RequestHandler)[] => [
    query("type", "type must be string").exists().bail().notEmpty(),
    handleValidation,
];

export const getLinkValidator = (): (ValidationChain | RequestHandler)[] => [
    body(undefined, "body must be array file name").isArray(),
    // body(undefined, "body must be array file name").custom(body => {
    //     body.some((v: unknown) => typeof v !== "string")
    // }),
    handleValidation,
];
