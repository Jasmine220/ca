export interface IAccount {
    id: string;
    email: string;
    password?: string;
    tenant?: {
        code: string;
        is_active: boolean;
    };
    updated_time: Date;
    created_time: Date;
    last_locked?: Date;
    failed_login: number;
    password_token?: string;
    token_time?: Date;
    is_active: boolean;
    roles: string[];
}
