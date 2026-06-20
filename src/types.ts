// Domain Data Models
export interface User {
    id: number;
    name: string;
    username: string;
    email: string;
    phone: string;
    website: string;
    company: {
        name: string;
        catchPhrase: string;
    };
}

export interface Post {
    id: number;
    userId: number;
    title: string;
    body: string;
}

// Application State
export type DashboardState =
    | { status: 'idle' }
    | { status: 'loading' }
    | { status: 'success'; users: User[]; posts: Post[]; filteredUsers: User[]; selectedUserId: number | null }
    | { status: 'error'; message: string };