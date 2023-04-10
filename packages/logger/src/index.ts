import winston, { LoggerOptions } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import { ConsoleTransportInstance } from "winston/lib/winston/transports";
import "winston-daily-rotate-file";

function getTransports(params?: {
    logFileEnabled?: string;
    folderLogsPath?: string;
}): (DailyRotateFile | ConsoleTransportInstance)[] {
    const fileEnabled = params?.logFileEnabled === "true" ? true : false;
    const logsPath = params?.folderLogsPath || "logs";
    const options = {
        file: {
            level: "info",
            filename: `${logsPath}/app-%DATE%.log`,
            datePattern: "YYYY-MM-DD-HH",
            handleExceptions: true,
            json: true,
            maxSize: "20m",
            maxFiles: "14d",
            colorize: true,
        },
        console: {
            level: "debug",
            handleExceptions: true,
            json: false,
            colorize: true,
        },
    };

    return fileEnabled === true
        ? [
              new winston.transports.DailyRotateFile(options.file),
              new winston.transports.Console(options.console),
          ]
        : [new winston.transports.Console(options.console)];
}

function getOptions(params?: {
    logFileEnabled?: string;
    folderLogsPath?: string;
}): LoggerOptions {
    return {
        format: winston.format.combine(
            winston.format.splat(),
            winston.format.timestamp({
                format: "YYYY-MM-DD HH:mm:ss.SSS",
            }),
            winston.format.printf((info: winston.Logform.TransformableInfo) => {
                const label = `${info.label === undefined ? "" : info.label}`;
                const func = `${
                    info.funName === undefined ? "" : "-" + info.funName
                }`;
                return `${info.timestamp} [${label}${func}] [${info.level}]: ${info.message}`;
            })
        ),
        transports: getTransports(params),
        exitOnError: false,
    };
}

declare module "winston" {
    interface Logger {
        config: typeof setConfiguration;
    }
}

function setConfiguration(
    this: winston.Logger,
    config?: {
        logFileEnabled: string;
        folderLogsPath: string;
    }
): void {
    const options = getOptions(config);
    this.configure(options);
}

const logger = winston.createLogger(getOptions());
logger.config = setConfiguration;

export default logger;
