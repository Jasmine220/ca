import "dotenv/config";

export const configs = {
    environment: process.env.CA_FILE_ENVIRONMENT || "dev",
    api: {
        prefix: "/api/v1",
    },
    app: {
        host: process.env.CA_FILE_HOST_NAME || "0.0.0.0",
        port: process.env.CA_FILE_PORT_NUMBER || "6806",
    },
    mongo: {
        addresses: [
            {
                host: process.env.CA_FILE_MONGO_HOST_1 || "127.0.0.1",
                port: process.env.CA_FILE_MONGO_PORT_1 || "27017",
            },
            {
                host: process.env.CA_FILE_MONGO_HOST_2 || "127.0.0.1",
                port: process.env.CA_FILE_MONGO_PORT_2 || "27018",
            },
            {
                host: process.env.CA_FILE_MONGO_HOST_3 || "127.0.0.1",
                port: process.env.CA_FILE_MONGO_PORT_3 || "27019",
            },
        ],
        username: process.env.CA_FILE_MONGO_USERNAME || "root",
        password: process.env.CA_FILE_MONGO_PASSWORD || "",
        authSource: process.env.CA_FILE_MONGO_AUTHOR_SOURCE || "admin",
        dbName: process.env.CA_FILE_MONGO_DB_NAME || "minio",
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
    keys: {
        public: process.env.CA_FILE_PUBLIC_KEY,
    },
    log: {
        logFileEnabled: process.env.CA_FILE_LOG_FILE_ENABLED || "false",
        folderLogsPath:
            process.env.CA_FILE_FOLDER_LOGS_PATH || `${__dirname}/../../logs`,
    },
    minio: {
        ip: process.env.CA_FILE_IP_CONNECT,
        port: process.env.CA_FILE_PORT_CONNECT || 9000,
        access: process.env.CA_FILE_ACCESS_KEY,
        secret: process.env.CA_FILE_SECRET_KEY,
        bucket: process.env.CA_FILE_BUCKET || "ca-file",
        uploadExpiredTime: process.env.CA_FILE_UPLOAD_EXPIRED_TIME || "900", // 15 * 60 ~ 15m
        downloadExpiredTime:
            process.env.CA_FILE_DOWNLOAD_EXPIRED_TIME || "3600", // 60 * 60 ~ 1h
    },
    redis: {
        host: process.env.CA_FILE_REDIS_HOST,
        port: process.env.CA_FILE_REDIS_PORT,
    },

    express: {
        host: process.env.CA_FILE_HOST_NAME || "0.0.0.0",
        port: process.env.CA_FILE_PORT_NUMBER || "6809",
    },
};
