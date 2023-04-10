export enum UserAction {
    CREATE = "CREATE",
    UPDATE = "UPDATE",
    RESET_PASSWORD = "RESET_PASSWORD",
    UPDATE_PASSWORD = "UPDATE_PASSWORD",
}

export interface IUserActivity {
    actor: string;
    action: string;
    time: Date;
    note?: string;
}

export interface IUser {
    id: string;
    fullname: string;
    email: string;
    department: string;
    position: string;
    phone: string;
    tenant?: string;
    updated_time: Date;
    created_time: Date;
    is_active: boolean;
    activities: IUserActivity[];
}
