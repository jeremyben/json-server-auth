import { writeFileSync, unlinkSync } from 'fs'
import { join } from 'path'
import { Application } from 'express'
import * as jsonServer from 'json-server'
import * as jsonServerAuth from '../..'
import { rewriter } from '../../guards'

export const USER = { email: 'jeremy@mail.com', password: '123456', name: 'Jeremy' }

export function inMemoryJsonServer(
	db: object = {},
	resourceGuardMap: { [resource: string]: number } = {}
): Application {
	const app = jsonServer.create()
	const router = jsonServer.router(db)
	// Must bind the router db to the app like the cli does
	// https://github.com/typicode/json-server/blob/master/src/cli/run.js#L74
	app['db'] = router['db']

	app.use(rewriter(resourceGuardMap))
	app.use(jsonServerAuth)
	app.use(router)

	return app
}

export const JSON_DB_PATH = join(__dirname, 'db.json')

export function createJsonDbFile(db: object = {}) {
	writeFileSync(JSON_DB_PATH, JSON.stringify(db))
}

export function deleteJsonDbFile() {
	unlinkSync(JSON_DB_PATH)
}
