import { RequestHandler, Router } from 'express'
import * as jwt from 'jsonwebtoken'
import * as jsonServer from 'json-server'
import { stringify } from 'querystring'
import { loadConfig, bodyParsingHandler, errorHandler, goNext } from './shared-middlewares'

/**
 * Logged Guard.
 * Check JWT.
 */
const loggedOnly: RequestHandler = (req, res, next) => {
	const { authorization } = req.headers
  const { auth } = req.app.config

	if (!authorization) {
		res.status(401).jsonp('Missing authorization header')
		return
	}

	const [scheme, token] = authorization.split(' ')

	if (scheme !== 'Bearer') {
		res.status(401).jsonp('Incorrect authorization scheme')
		return
	}

	if (!token) {
		res.status(401).jsonp('Missing token')
		return
	}

	try {
		jwt.verify(token, auth.secret)
		// Add claims to request
		req.claims = jwt.decode(token) as any
		next()
	} catch (err) {
		res.status(401).jsonp((err as jwt.JsonWebTokenError).message)
	}
}

/**
 * Owner Guard.
 * Checking userId reference in the request or the resource.
 * Inherits from logged guard.
 */
// tslint:disable:triple-equals - so we simply compare resource id (integer) with jwt sub (string)
const privateOnly: RequestHandler = (req, res, next) => {
	loggedOnly(req, res, () => {
		const { db } = req.app
		if (db == null) {
			throw Error('You must bind the router db to the app')
		}

		// TODO: handle query params instead of removing them
		const path = req.url.replace(`?${stringify(req.query)}`, '')
		const [, mod, resource, id] = path.split('/')

		// Creation and replacement
		// check userId on the request body
		if (req.method === 'POST' || req.method === 'PUT') {
			// TODO: use foreignKeySuffix instead of assuming the default "Id"
			const hasRightUserId = req.body.userId == req.claims!.sub
			// No userId reference when creating a new user (duh)
			const isUserResource = resource === 'users'

			if (hasRightUserId || isUserResource) {
				next()
			} else {
				res.status(403).jsonp(
					'Private resource creation: request body must have a reference to the owner id'
				)
			}
			return
		}

		// Query and update
		// check userId on the resource
		if (req.method === 'GET' || req.method === 'PATCH' || req.method === 'DELETE') {
			let hasRightUserId: boolean

			// TODO: use foreignKeySuffix instead of assuming the default "Id"
			if (id) {
				// prettier-ignore
				const entity = db.get(resource).getById(id).value() as any
				// get id if we are in the users collection
				const userId = resource === 'users' ? entity.id : entity.userId

				hasRightUserId = userId == req.claims!.sub
			} else {
				const entities = db.get(resource).value() as any[]

				// TODO: Array.every() for properly secured access.
				// Array.some() is too relax, but maybe useful for prototyping usecase.
				// But first we must handle the query params.
				hasRightUserId = entities.some((entity) => entity.userId == req.claims!.sub)
			}

			if (hasRightUserId) {
				next()
			} else {
				res.status(403).jsonp(
					'Private resource access: entity must have a reference to the owner id'
				)
			}
			return
		}

		// We let pass the other methods (HEAD, OPTIONS)
		// as they are not handled by json-server router,
		// but maybe by another user-defined middleware
		next()
	})
}
// tslint:enable

/**
 * Forbid all methods except GET.
 */
const readOnly: RequestHandler = (req, res, next) => {
	if (req.method === 'GET') {
		next()
	} else {
		res.status(403).jsonp('Read only')
	}
}

// prettier-ignore
type ReadWriteBranch =
	({ read, write }: { read: RequestHandler, write: RequestHandler }) => RequestHandler

/**
 * Allow applying a different middleware for GET request (read) and others (write)
 * (middleware returning a middleware)
 */
const branch: ReadWriteBranch = ({ read, write }) => {
	return (req, res, next) => {
		if (req.method === 'GET') {
			read(req, res, next)
		} else {
			write(req, res, next)
		}
	}
}

/**
 * Remove guard mod from baseUrl, so lowdb can handle the resource.
 */
const flattenUrl: RequestHandler = (req, res, next) => {
	// req.url is writable and used for redirection,
	// but app.use() already trim baseUrl from req.url,
	// so we use app.all() that leaves the baseUrl with req.url,
	// so we can rewrite it.
	// https://stackoverflow.com/questions/14125997/

	req.url = req.url.replace(/\/[640]{3}/, '')
	next()
}

/**
 * Guards router
 */
export default Router()
	.use(loadConfig)
	.use(bodyParsingHandler)
	.all('/666/*', flattenUrl)
	.all('/664/*', branch({ read: goNext, write: loggedOnly }), flattenUrl)
	.all('/660/*', loggedOnly, flattenUrl)
	.all('/644/*', branch({ read: goNext, write: privateOnly }), flattenUrl)
	.all('/640/*', branch({ read: loggedOnly, write: privateOnly }), flattenUrl)
	.all('/600/*', privateOnly, flattenUrl)
	.all('/444/*', readOnly, flattenUrl)
	.all('/440/*', loggedOnly, readOnly, flattenUrl)
	.all('/400/*', privateOnly, readOnly, flattenUrl)
	.use(errorHandler)

/**
 * Transform resource-guard mapping to proper rewrite rule supported by express-urlrewrite.
 * Return other rewrite rules as is, so we can use both types in routes.json.
 * @example
 * { 'users': 600 } => { '/users*': '/600/users$1' }
 */
export function parseGuardsRules(resourceGuardMap: { [resource: string]: any }) {
	return Object.entries(resourceGuardMap).reduce(
		(routes, [resource, guard]) => {
			const isGuard = /^[640]{3}$/m.test(String(guard))

			if (isGuard) {
				routes[`/${resource}*`] = `/${guard}/${resource}$1`
			} else {
				// Return as is if not a guard
				routes[resource] = guard
			}

			return routes
		},
		{} as ArgumentType<typeof jsonServer.rewriter>
	)
}

/**
 * Conveniant method to use directly resource-guard mapping
 * with JSON Server rewriter (which itself uses express-urlrewrite).
 * Works with normal rewrite rules as well.
 */
export function rewriter(resourceGuardMap: { [resource: string]: number }) {
	const routes = parseGuardsRules(resourceGuardMap)
	return jsonServer.rewriter(routes)
}
