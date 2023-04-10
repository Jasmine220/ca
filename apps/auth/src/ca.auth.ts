import createApp from "app";
import { router } from "./routes";
import { configs } from "./configs";
import logger from "logger";
import {
    connectedToMongo,
    connectedToRedis,
    connectMongo,
    connectRedis,
} from "./database";

function main(): void {
    logger.config(configs.log);
    const host = configs.express.host;
    const port = configs.express.port;
    const environment = configs.environment;

    const startApp = (): void => {
        const app = createApp(router, environment);
        app.listen(Number(port), host, () => {
            logger.info("Listening on: %s:%d", host, port);
        });
    };
    connectMongo(() => {
        if (connectedToRedis()) {
            startApp();
        }
    });
    connectRedis(() => {
        if (connectedToMongo()) {
            startApp();
        }
    });
}

main();
