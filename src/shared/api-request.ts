/** The handler's validated JSON input, shared with the HTTP client's inferred contract. */
export interface ApiRequest<T> extends Request {
	readonly __apiInput?: T;
	json(): Promise<T>;
}
