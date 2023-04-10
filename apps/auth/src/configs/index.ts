import "dotenv/config";

export const configs = {
    environment: process.env.CA_AUTH_ENVIRONMENT || "dev",
    api: {
        prefix: "/api/v1",
    },
    express: {
        host: process.env.CA_AUTH_HOST_NAME || "0.0.0.0",
        port: process.env.CA_AUTH_PORT_NUMBER || "6801",
    },
    mongo: {
        addresses: [
            {
                host: process.env.CA_AUTH_MONGO_HOST_1 || "127.0.0.1",
                port: process.env.CA_AUTH_MONGO_PORT_1 || "27017",
            },
            {
                host: process.env.CA_AUTH_MONGO_HOST_2 || "127.0.0.1",
                port: process.env.CA_AUTH_MONGO_PORT_2 || "27018",
            },
            {
                host: process.env.CA_AUTH_MONGO_HOST_3 || "127.0.0.1",
                port: process.env.CA_AUTH_MONGO_PORT_3 || "27019",
            },
        ],
        username: process.env.CA_AUTH_MONGO_USERNAME || "root",
        password: process.env.CA_AUTH_MONGO_PASSWORD || "",
        authSource: process.env.CA_AUTH_MONGO_AUTHOR_SOURCE || "admin",
        dbName: process.env.CA_AUTH_MONGO_DB_NAME || "auth",
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
    redis: {
        host: process.env.CA_AUTH_REDIS_HOST || "172.0.0.1",
        port: process.env.CA_AUTH_REDIS_PORT || "6380",
    },
    keys: {
        secret: process.env.CA_AUTH_SECRET_KEY,
        public: process.env.CA_AUTH_PUBLIC_KEY,
    },
    log: {
        logFileEnabled: process.env.CA_AUTH_LOG_FILE_ENABLED || "false",
        folderLogsPath:
            process.env.CA_AUTH_FOLDER_LOGS_PATH || `${__dirname}/../../logs`,
    },
    saltRounds: process.env.CA_AUTH_SALT_ROUNDS || "10",
    services: {
        ad: {
            prefix: process.env.CA_AUTH_AD_SERVICE_PREFIX || "/",
            host: process.env.CA_AUTH_AD_SERVICE_HOST || "http://127.0.0.1",
            port: process.env.CA_AUTH_AD_SERVICE_PORT || "6809",
            getUrl: function (): string {
                return `${this.host}:${this.port}${this.prefix}`;
            },
        },
        tenant: {
            prefix:
                process.env.CA_AUTH_TENANT_SERVICE_PREFIX ||
                "/api/v1/in/tenants",
            host: process.env.CA_AUTH_TENANT_SERVICE_HOST || "http://127.0.0.1",
            port: process.env.CA_AUTH_TENANT_SERVICE_PORT || "6804",
            getUrl: function (): string {
                return `${this.host}:${this.port}${this.prefix}`;
            },
        },
        mail: {
            prefix:
                process.env.CA_AUTH_MAIL_SERVICE_PREFIX || "/api/v1/in/mail",
            host: process.env.CA_AUTH_MAIL_SERVICE_HOST || "http://127.0.0.1",
            port: process.env.CA_AUTH_MAIL_SERVICE_PORT || "6803",
            getUrl: function (): string {
                return `${this.host}:${this.port}${this.prefix}`;
            },
        },
    },
};
