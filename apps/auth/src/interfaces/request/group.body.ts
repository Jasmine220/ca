export interface CreateGroupReqBody {
    name: string;
    description?: string;
    leader_id?: string;
    members: string[];
}

export interface UpdateGroupReqBody {
    name?: string;
    description?: string;
    leader_id?: string;
    members: string[];
}
