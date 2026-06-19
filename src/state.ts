import type { DashboardState } from './types';
import { getUsers, getPosts } from './api';
import { renderApp } from './ui';

//initial state
let _state: DashboardState = { status: 'idle' };

export function getState() : Readonly<DashboardState> {
    return _state;
}

//change state and re-render ui according to the state
export function setState(newState: DashboardState): void {
    _state = newState;
    renderApp();
}

//call api parallel
export async function loadDashboardData(): Promise<void> {
    setState({status: 'loading'})

    try {
        const [users, posts] = await Promise.all([getUsers(), getPosts()]);

        setState({
            status: "success",
            users,
            posts,
            filteredUsers: users, //same as original list
            selectedUserId: null
        });

    } catch (error){
        setState({
            status: "error",
            message: error instanceof Error ? error.message : `Error: ${error}`
        });
    }
}

//handle filter
export function filterUsers(searchTerm: string): void {
    if (_state.status !== 'success') return;

    const normalizeTerm = searchTerm.toLowerCase().trim();
    const filtered = _state.users.filter( user =>
        user.name.toLowerCase().includes(normalizeTerm) ||
        user.email.toLowerCase().includes(normalizeTerm)
    )

    setState({
        ..._state,
        filteredUsers: filtered
    })
}

//handle view user detail
export function selectUser(userId: number | null): void {
    if (_state.status !== 'success') return;

    setState({
        ..._state,
        selectedUserId: userId
    })
}
