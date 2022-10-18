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
export async function createGame(game) {
    return await client.from('games').insert(game);
}

export async function getGames() {
    return await client.from('games').select('*');
}

export async function getGame(id) {
    return await client
        .from('games')
        .select('*, guesses(*)')
        .eq('id', id)
        .order('created_at', { foreignTable: 'guesses', ascending: false })
        .single();
}

export async function createGuess(guess) {
    return await client.from('guesses').insert(guess).single();
}

export async function getGuess(id) {
    return await client.from('guesses').select(`*`).eq('id', id).single();
}

export function onGuess(gameId, handleGuess) {
    client.from(`guesses:game_id=eq.${gameId}`).on('INSERT', handleGuess).subscribe();
}

export async function uploadImage(bucketName, imagePath, imageFile) {
    const bucket = client.storage.from(bucketName);
    const response = await bucket.upload(imagePath, imageFile, {
        cacheControl: '3600',
    });
    if (response.error) {
        return null;
    }
    // Construct the URL to this image:
    const url = `${SUPABASE_URL}/storage/v1/object/public/${response.data.Key}`;
    return url;
}

export async function addPath(path) {
    return await client.from('drawings').insert(path).single();
}

export async function getPaths() {
    return await client.from('drawings').select('path');
}

export function onPath(handlePath) {
    client.from(`drawings`).on('*', handlePath).subscribe();
}

export async function clearCanvas() {
    return await client.from('drawings').delete().eq('room', 1);
}
