// Development API origin, isolated for future environment-based configuration.
const API_BASE_URL = 'http://localhost:8080';

/** Fetch and parse a JSON response, returning the caller's expected type. */
export async function get<T>(path: string): Promise<T> {
	const response = await fetch(new URL(path, API_BASE_URL));

	if (!response.ok) {
		throw new Error(`HTTP request from client failed with status ${response.status}`);
	}

	return (await response.json()) as T;
}
