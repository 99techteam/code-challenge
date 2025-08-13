import { config, type DotenvConfigOptions } from "dotenv";

export class Config {
	constructor(options?: DotenvConfigOptions) {
		config(options);
	}

	get(name: string): string | undefined;
	get(name: string, defaultValue: string): string;

	get<T>(key: string, defaultValue?: T) {
		const value = process.env[key];
		if (value !== undefined) {
			return value;
		}
		return defaultValue;
	}

	getOrThrow(key: string) {
		const value = process.env[key];
		if (!value) {
			throw new Error(`Environment variable ${key} is not defined`);
		}
		return value;
	}
}
