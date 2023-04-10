import { Redis } from "ioredis";
import logger from "logger";
import { configs } from "../configs";

export const redis: Redis = new Redis({
    host: configs.redis.host,
    port: Number(configs.redis.port),
    lazyConnect: true,
    retryStrategy: function (times): number | void | null {
        if (times % 5 === 0) {
            return null;
        }
        return 5 * 1000;
    },
});

export function connectRedis(onSuccess: () => void): void {
    redis
        .connect()
        .then(() => {
            logger.info("Connected to redis");
            onSuccess();
        })
        .catch((reason) => {
            logger.error("%O", reason);
        });
}

export function connectedToRedis(): boolean {
    return redis.status === "ready";
}
