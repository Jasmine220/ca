export {};

export interface Payload {
    id: string;
    roles: string[];
    tenant?: string;
    email: string;
    type: string;
}

declare global {
    // eslint-disable-next-line
    namespace Express {
        export interface Request {
            payload?: Payload;
            requestTime: Date;
            requestId: string;
        }
    }
}
