import { handleValidation } from "app";
import { RequestHandler } from "express";
import { body, query, ValidationChain } from "express-validator";

export const createUserValidator = (): (ValidationChain | RequestHandler)[] => [
    body("email", "email must be string and not empty")
        .isString()
        .bail()
        .notEmpty(),
    body("fullname", "fullName must be string").optional().isString(),
    body("password", "password must be string").isString().bail().notEmpty(),
    body("department", "department must be string").optional().isString(),
    body("position", "position must be string").optional().isString(),
    body("roles").replace([null, undefined], []),
    body("roles", "roles must be array of ['SA', 'TA', 'EU', 'L1', 'L2']")
        .isArray()
        .bail()
        .custom((roles) => {
            if (roles.length === 0) {
                return true;
            }

            return !roles.some(
                (v: unknown) =>
                    typeof v !== "string" ||
                    !["SA", "TA", "EU", "L1", "L2"].includes(v)
            );
        }),
    body("is_active").replace([null, undefined], true),
    body("is_active", "is_active must boolean").exists().bail().isBoolean(),
    query("tenant").customSanitizer((value, { req }) => {
        if (!req.payload.roles.includes("SA")) {
            return req.payload.tenant;
        } else {
            return value;
        }
    }),
    // check tenant if user creating is not SA
    query("tenant", "tenant must be string and not empty").custom(
        (tenant, { req }) => {
            if (!req.body.roles || !Array.isArray(req.body.roles)) {
                return true;
            }
            return !(!tenant && !req.body.roles.includes("SA"));
        }
    ),
    handleValidation,
];

export const updateUserValidator = (): (ValidationChain | RequestHandler)[] => [
    body("fullname", "fullname must be string").optional().isString(),
    body("department", "department must be string").optional().isString(),
    body("position", "position must be string").optional().isString(),
    body("is_active", "is_active must be true or false").optional().isBoolean(),
    body(
        "roles",
        "roles must be array of ['SA', 'TA', 'EU', 'L1', 'L2']"
    ).custom((roles) => {
        if (roles === undefined) {
            return true;
        }
        if (!roles === null) {
            return false;
        }
        if (!Array.isArray(roles)) {
            return false;
        }
        if (roles.length === 0) {
            return false;
        }

        return !roles.some(
            (v: unknown) =>
                typeof v !== "string" ||
                !["SA", "TA", "EU", "L1", "L2"].includes(v)
        );
    }),
    handleValidation,
];

export const findUserValidator = (): (ValidationChain | RequestHandler)[] => [
    body("query", "query must be string").optional().isString(),
    body("sort", "sort must be string").optional().isString(),
    query("size").replace([null, undefined], 10),
    query("page").replace([null, undefined], 0),
    query("size", "size must be integer and in [1:50] or equal -1")
        .isInt({ min: -1, max: 50 })
        .custom((v) => v != 0),
    query("page", "page must be integer and greater than -1").isInt({ min: 0 }),
    handleValidation,
];

export const findUserByIdsValidator = (): (
    | ValidationChain
    | RequestHandler
)[] => [
    body("ids", "ids must be array of string")
        .notEmpty()
        .bail()
        .isArray()
        .bail()
        .custom((id) => !id.some((v: unknown) => typeof v !== "string")),
    handleValidation,
];

export const updateActivationValidator = (): (
    | ValidationChain
    | RequestHandler
)[] => [
    body("status", "status must boolean").exists().bail().isBoolean(),
    body("ids", "ids must be array of string")
        .notEmpty()
        .bail()
        .isArray()
        .bail()
        .custom((id) => !id.some((v: unknown) => typeof v !== "string")),
    handleValidation,
];

export const importUserValidator = (): (ValidationChain | RequestHandler)[] => [
    body(undefined, "body must be array of user").isArray(),
    handleValidation,
    body("*.index", "index must be integer and greater than -1").isInt({
        min: 0,
    }),
    body("*.email", "email must be string and not empty")
        .isString()
        .bail()
        .notEmpty(),
    body("*.password", "password must be string and not empty")
        .optional()
        .isString(),
    body("*.fullname", "fullname must be string").optional().isString(),
    body("*.department", "department must be string").optional().isString(),
    body("*.position", "position must be string").optional().isString(),
    handleValidation,
];
