import express, {
    Application,
    NextFunction,
    Request,
    Response,
    Router,
} from "express";
import { handleValidation, requestInitialization } from "./middlewares";
import "express-async-errors";
import {
    resultMiddlewares,
    parserMiddlewares,
    securityMiddlewares,
} from "./middlewares";
import { HttpStatus } from "./constant";

const notFoundMiddlewares = (
    req: Request,
    _: Response,
    next: NextFunction
): void => {
    const requestedUrl = `${req.protocol}://${req.get("Host")}${req.url}`;
    const error = {
        status: HttpStatus.NOT_FOUND,
        code: "URL_NOT_FOUND",
        errors: [
            {
                method: req.method,
                url: requestedUrl,
            },
        ],
    };
    if (!req.route) {
        next(error);
    }
    next();
};

const createApp = (applicationRouter: Router, env?: string): Application => {
    const app: Application = express();
    app.use(securityMiddlewares);
    app.use(parserMiddlewares);
    app.use(requestInitialization);
    app.use(applicationRouter);
    app.use(notFoundMiddlewares);
    app.use(resultMiddlewares(env));
    return app;
};

export default createApp;
export * from "./result";
export * from "./error";
export * from "./request";
export * from "./constant";
export { handleValidation };
