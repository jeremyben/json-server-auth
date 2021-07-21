import * as bcrypt from 'bcryptjs'
import { Handler, Router } from 'express'
import * as jwt from 'jsonwebtoken'
import { bodyParsingHandler, errorHandler } from './shared-middlewares'
import {
	EMAIL_REGEX,
	JWT_EXPIRES_IN,
	JWT_SECRET_KEY,
	MIN_PASSWORD_LENGTH,
	SALT_LENGTH,
} from './constants'

interface User {
	id: string
	email: string
	password: string
	[key: string]: any // Allow any other field
}

type ValidateHandler = ({ required }: { required: boolean }) => Handler

/**
 * Validate email and password
 */
const validate: ValidateHandler =
	({ required }) =>
	(req, res, next) => {
		const { email, password } = req.body as Partial<User>

		if (required && (!email || !email.trim() || !password || !password.trim())) {
			res.status(400).jsonp('Email and password are required')
			return
		}

		if (email && !email.match(EMAIL_REGEX)) {
			res.status(400).jsonp('Email format is invalid')
			return
		}

		if (password && password.length < MIN_PASSWORD_LENGTH) {
			res.status(400).jsonp('Password is too short')
			return
		}

		next()
	}

/**
 * Register / Create a user
 */
const create: Handler = (req, res, next) => {
	const { email, password, ...rest } = req.body as User
	const { db } = req.app

	if (db == null) {
		// json-server CLI expose the router db to the app
		// (https://github.com/typicode/json-server/blob/master/src/cli/run.js#L74),
		// but if we use the json-server module API, we must do the same.
		throw Error('You must bind the router db to the app')
	}

	const existingUser = db.get('users').find({ email }).value()
	if (existingUser) {
		res.status(400).jsonp('Email already exists')
		return
	}

	bcrypt
		.hash(password, SALT_LENGTH)
		.then((hash) => {
			// Create users collection if doesn't exist,
			// save password as hash and add any other field without validation
			try {
				return db
					.get('users')
					.insert({ email, password: hash, ...rest })
					.write()
			} catch (error) {
				throw Error('You must add a "users" collection to your db')
			}
		})
		.then((user: User) => {
			return new Promise<{ accessToken: string; user: User }>((resolve, reject) => {
				jwt.sign(
					{ email },
					JWT_SECRET_KEY,
					{ expiresIn: JWT_EXPIRES_IN, subject: String(user.id) },
					(error, accessToken) => {
						if (error) reject(error)
						else resolve({ accessToken: accessToken!, user })
					}
				)
			})
		})
		.then(({ accessToken, user }) => {
			const { password: _, ...userWithoutPassword } = user
			res.status(201).jsonp({ accessToken, user: userWithoutPassword })
		})
		.catch(next)
}

/**
 * Login
 */
const login: Handler = (req, res, next) => {
	const { email, password } = req.body as User
	const { db } = req.app

	if (db == null) {
		throw Error('You must bind the router db to the app')
	}

	const user = db.get('users').find({ email }).value() as User

	if (!user) {
		res.status(400).jsonp('Cannot find user')
		return
	}

	bcrypt
		.compare(password, user.password)
		.then((same) => {
			if (!same) throw 400

			return new Promise<string>((resolve, reject) => {
				jwt.sign(
					{ email },
					JWT_SECRET_KEY,
					{ expiresIn: JWT_EXPIRES_IN, subject: String(user.id) },
					(error, accessToken) => {
						if (error) reject(error)
						else resolve(accessToken!)
					}
				)
			})
		})
		.then((accessToken: string) => {
			const { password: _, ...userWithoutPassword } = user
			res.status(200).jsonp({ accessToken, user: userWithoutPassword })
		})
		.catch((err) => {
			if (err === 400) res.status(400).jsonp('Incorrect password')
			else next(err)
		})
}

/**
 * Patch and Put user
 */
// TODO: create new access token when password or email changes
const update: Handler = (req, res, next) => {
	const { password } = req.body as Partial<User>

	if (!password) {
		next() // Simply continue with json-server router
		return
	}

	bcrypt
		.hash(password, SALT_LENGTH)
		.then((hash) => {
			req.body.password = hash
			next()
		})
		.catch(next)
}

/**
 * Users router
 */
// Must match routes with and without guards
export default Router()
	.use(bodyParsingHandler)
	.post('/users|register|signup', validate({ required: true }), create)
	.post('/[640]{3}/users', validate({ required: true }), create)
	.post('/login|signin', validate({ required: true }), login)
	.put('/users/:id', validate({ required: true }), update)
	.put('/[640]{3}/users/:id', validate({ required: true }), update)
	.patch('/users/:id', validate({ required: false }), update)
	.patch('/[640]{3}/users/:id', validate({ required: false }), update)
	.use(errorHandler)
