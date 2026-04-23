export interface Resource {
    id: number;
    name: string;
    description: string;
    isFinish: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface ResourceFilters {
    isFinish?: boolean;
    search?: string;
}
