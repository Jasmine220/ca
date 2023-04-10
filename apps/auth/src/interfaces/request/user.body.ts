export interface CreateUserReqBody {
    email: string;
    fullname?: string;
    roles: string[];
    phone?: string;
    password: string;
    department?: string;
    position?: string;
    is_active: boolean;
}

export interface UpdateUserReqBody {
    fullname?: string;
    phone?: string;
    roles?: string[];
    department?: string;
    position?: string;
    is_active?: boolean;
}

export interface UserImport {
    index: number;
    email: string;
    fullname?: string;
    phone?: string;
    tenant?: string;
    password?: string;
    department?: string;
    position?: string;
}

export interface UpdateUserActivationReqBody {
    ids: string[];
    status: boolean;
}

export type ImportUserReqBody = UserImport[];
