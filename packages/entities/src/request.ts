export interface ITRequest {
    id: string;
    name: string;
    description?: string;
    leader_id?: string;
    tenant: string;
    created_time: Date;
    is_active: boolean;
    members: string[];
}
