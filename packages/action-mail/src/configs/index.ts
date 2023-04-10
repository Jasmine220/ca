import "dotenv/config";

export const configs = {
    environment: process.env.CA_ACTION_EMAIL_ENVIRONMENT || "dev",
    express: {
        host: process.env.CA_ACTION_MAIL_HOST_NAME || "0.0.0.0",
        port: process.env.CA_ACTION_MAIL_NUMBER || "6810",
    },
    log: {
        logFileEnabled: process.env.CA_AUTH_LOG_FILE_ENABLED || "false",
        folderLogsPath:
            process.env.CA_AUTH_FOLDER_LOGS_PATH || `${__dirname}/../../logs`,
    },
    services: {
        mail: {
            prefix: process.env.CA_AUTH_AD_SERVICE_PREFIX || "/",
            host: process.env.CA_ACTION_EMAIL_IP || "http://127.0.0.1",
            port: process.env.CA_ACTION_EMAIL_PORT || "6806",
            getUrl: function (): string {
                return `${this.host}:${this.port}${this.prefix}`;
            },
        },
    },
    mongo: {
        addresses: [
            {
                host: process.env.CA_REQUEST_MONGO_HOST_1 || "10.15.220.60",
                port: process.env.CA_REQUEST_MONGO_PORT_1 || "27001",
            },
            {
                host: process.env.CA_REQUEST_MONGO_HOST_2 || "10.15.220.60",
                port: process.env.CA_REQUEST_MONGO_PORT_2 || "27002",
            },
            {
                host: process.env.CA_REQUEST_MONGO_HOST_3 || "10.15.220.60",
                port: process.env.CA_REQUEST_MONGO_PORT_3 || "27003",
            },
        ],
        username: process.env.CA_REQUEST_MONGO_USERNAME || "ca_request",
        password: process.env.CA_REQUEST_MONGO_PASSWORD || "1",
        authSource:
            process.env.CA_REQUEST_MONGO_AUTHOR_SOURCE || "db_ca_request",
        dbName: process.env.CA_REQUEST_MONGO_DB_NAME || "db_ca_request",
        templateUri:
            "mongodb://${username}:${password}@${url}/${dbName}" +
            "?retryWrites=false&w=majority&authSource=${authSource}" +
            "&serverSelectionTimeoutMS=5000&connectTimeoutMS=10000" +
            "&authMechanism=SCRAM-SHA-256",
        getUri: function (): string {
            const url = this.addresses.map((a) => `${a.host}:${a.port}`).join();
            let uri = this.templateUri;
            uri = uri.replace("${username}", this.username);
            uri = uri.replace("${password}", this.password);
            uri = uri.replace("${authSource}", this.authSource);
            uri = uri.replace("${dbName}", this.dbName);
            uri = uri.replace("${url}", url);
            return uri;
        },
    },
};
