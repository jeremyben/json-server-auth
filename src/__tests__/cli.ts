import { spawn } from 'child_process'
import { unlinkSync, writeFileSync } from 'fs'
import { join } from 'path'
import * as treeKill from 'tree-kill'

const JSON_DB_PATH = join(__dirname, 'db.json')
const cmd = `yarn ts-node --transpile-only src/bin "${JSON_DB_PATH}"`

beforeAll(() => {
	const db = {
		users: [],
	}

	writeFileSync(JSON_DB_PATH, JSON.stringify(db))
})

afterAll(() => unlinkSync(JSON_DB_PATH))

describe('CLI', () => {
	test('Basic CLI works', (done) => {
		const child = spawn(cmd, { shell: true })

		child.stdout.on('data', (data: Buffer) => {
			// console.log(data.toString().trim())
			const ok = data.toString().trim().includes('Done')
			if (ok) treeKill(child.pid)
		})

		child.stderr.on('data', (data: Buffer) => {
			treeKill(child.pid)
			expect(data.toString()).toBeFalsy()
		})

		child
			.on('close', () => done())
			.on('error', (err) => {
				treeKill(child.pid)
				expect(err).toBeUndefined()
				done()
			})
	})
})
