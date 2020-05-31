import * as supertest from 'supertest'
import { inMemoryJsonServer, USER } from './shared/tools'

let rq: supertest.SuperTest<supertest.Test>
let bearer: { Authorization: string }

beforeEach(async () => {
	const db = {
		users: [{ id: 1, email: 'albert@gmail.com' }],
		messages: [
			{ id: 1, text: 'other', userId: 1 },
			{ id: 2, text: 'mine', userId: 2 },
		],
	}
	const guards = {
		users: 600,
		messages: 640,
	}
	const app = inMemoryJsonServer(db, guards)
	rq = supertest(app)

	// Create user (will have id:2) and keep access token
	const registerRes = await rq.post('/register').send(USER)
	bearer = { Authorization: `Bearer ${registerRes.body.accessToken}` }
})

describe('600: owner can read/write', () => {
	test('[SAD] cannot list all users', async () => {
		await rq.get('/users').expect(401)
		await rq.get('/users').set(bearer).expect(403)
	})

	test('[SAD] cannot get other users', async () => {
		await rq.get('/users/1').expect(401)
		await rq.get('/users/1').set(bearer).expect(403)
	})

	test('[HAPPY] can get own information', async () => {
		await rq.get('/users/2').expect(401)
		await rq.get('/users/2').set(bearer).expect(200)
	})
})

describe('640: owner can read/write, logged can read', () => {
	test('[HAPPY] can list messages if logged', () => {
		return rq.get('/messages').set(bearer).expect(200)
	})

	test('[HAPPY] can write new messages if logged', () => {
		return rq
			.post('/messages')
			.send({ text: 'yo', userId: 2 })
			.set(bearer)
			.expect(201, { text: 'yo', id: 3, userId: 2 })
	})

	test('[HAPPY] can edit own messages', () => {
		return rq
			.patch('/messages/2')
			.send({ text: 'changed' })
			.set(bearer)
			.expect(200, { text: 'changed', id: 2, userId: 2 })
	})

	test('[HAPPY] can read messages from others', () => {
		return rq.get('/messages/1').set(bearer).expect(200, { id: 1, text: 'other', userId: 1 })
	})

	test("[SAD] can't list messages if not logged", () => {
		return rq.get('/messages').expect(401)
	})
})
