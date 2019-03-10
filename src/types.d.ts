// tslint:disable:no-implicit-dependencies ban-types no-namespace

interface AuthConfig {
	secret: string
	minPassLength: number
	emailRegex: string|RegExp
	saltLength: number
	jwt: JwtConfig
}

interface JwtConfig {
	expiresIn: string|number
	algorithm?: string
	audience?: string
	issuer?: string
}

declare type ArgumentType<F extends Function> = F extends (arg: infer Arg) => any ? Arg : never

declare namespace Express {
	export interface Application {

		config: {
			auth: AuthConfig
			[key: string]: any
		};

		/**
		 * @see https://github.com/typicode/lowdb
		 * TODO: better typings
		 */
		db?: {
			_: import('lodash').LoDashStatic
			getState: () => any
			setState: (state: any) => any
			get: (path: string) => any
			set: (path: string, value?: any) => any
			unset: (path: string) => any
			has: (path: string) => any
			defaults: (collections: object) => any
			read: () => any
			write: () => any
		}
	}

	export interface Request {
		// claims?: ReturnType<typeof import('jsonwebtoken').decode>
		claims?: { email: string; iat: number; exp: number; sub: string }
	}
}
