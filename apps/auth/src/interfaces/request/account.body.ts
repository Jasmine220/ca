export interface AccountReqBody {
    id: string;
    email: string;
    password?: string;
    is_active: boolean;
    tenant?: string;
    roles: string[];
}

export interface UpdateTenantActivationReqBody {
    tenants: string[];
    status: boolean;
}
