const SUPABASE_URL = 'https://wyahsnckwfdvynrkcmfb.supabase.co';
const SUPABASE_KEY =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5YWhzbmNrd2ZkdnlucmtjbWZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NjU3Njg3NjAsImV4cCI6MTk4MTM0NDc2MH0.hjMjg_SGtAjMrQoqy7-O_U24VxEC35aarsWAtGT4oEU';
const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

/* Auth related functions */

export function getUser() {
    return client.auth.user();
}

export async function signUpUser(email, password) {
    return await client.auth.signUp({
        email,
        password,
    });
}

export async function signInUser(email, password) {
    return await client.auth.signIn({
        email,
        password,
    });
}

export async function signOutUser() {
    return await client.auth.signOut();
}

/* Data functions */

export async function addPath(path) {
    return await client.from('drawings').insert(path).single();
}

export async function getPaths() {
    return await client.from('drawings').select('path');
}

export function onPath(handlePath) {
    client.from(`drawings`).on('ALL', handlePath).subscribe();
}

export async function clearCanvas() {
    return await client.from('drawings').delete().eq('room', 1);
}
