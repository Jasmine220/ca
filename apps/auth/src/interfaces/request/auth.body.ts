export interface LoginReqBody {
    email: string;
    password: string;
}

export interface CheckReqBody {
    email: string;
}

export interface UpdatePasswordReqBody {
    old_password: string;
    new_password: string;
}
