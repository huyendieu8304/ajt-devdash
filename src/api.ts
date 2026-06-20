//generic fetch helper
import type {Post, User} from "./types.ts";

export async function fetchJson<T> (url: string) : Promise<T> {
    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const data: T = await response.json();
        return data as T;
    } catch (error) {
        console.error(`Fetch error từ URL: ${url}`, error);
        throw error;
    }
}


//functions that realy call API, using
const BASE_URL = 'https://jsonplaceholder.typicode.com';

export async function getUsers(): Promise<User[]> {
    return fetchJson<User[]>(`${BASE_URL}/users`);
}

export async function getPosts(): Promise<Post[]> {
    return fetchJson<Post[]>(`${BASE_URL}/posts`);
}