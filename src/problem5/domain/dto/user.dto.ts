export interface User {
	id: string;
	name: string;
	email: string;
}

export interface UserFilter {
	name?: string;
	email?: string;
}