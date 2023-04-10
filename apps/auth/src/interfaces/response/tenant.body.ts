export interface GetTenantResBody {
    id: string;
    code: string;
    name?: string;
    description?: string;
    webconsent_url?: string;
    is_active: boolean;
}

export type TenantResBody = GetTenantResBody;
