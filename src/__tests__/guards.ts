import * as supertest from 'supertest'
import { inMemoryJsonServer, USER } from './shared/tools'

let rq: supertest.SuperTest<supertest.Test>
let bearer: { Authorization: string }
let db: { users: any[]; messages: any[]; secrets: any[] }

beforeEach(async () => {
	db = {
		users: [{ id: 1, email: 'albert@gmail.com' }],
		messages: [
			{ id: 1, text: 'other', userId: 1 },
			{ id: 2, text: 'mine', userId: 2 },
		],
		secrets: [],
	}

	const guards = {
		users: 600,
		messages: 640,
		secrets: 600,
	}

	const app = inMemoryJsonServer(db, guards)
	rq = supertest(app)

	// Create user (will have id:2) and keep access token
	const res = await rq.post('/register').send(USER)
	bearer = { Authorization: `Bearer ${res.body.accessToken}` }
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

	test('[HAPPY] can write and read from private collection', async () => {
		await rq.post('/secrets').set(bearer).send({ size: 'big', userId: '2' }).expect(201)
		const res = await rq.get('/secrets/1').set(bearer)
		expect(res.body).toEqual({ id: 1, userId: '2', size: 'big' })
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

test('[HAPPY] create another user after setting guards', async () => {
	const res = await rq
		.post('/users')
		.send({ email: 'arthur@email.com', password: '1234' })
		.expect(201)

	const otherBearer = { Authorization: `Bearer ${res.body.accessToken}` }

	await rq.get('/users/3').set(otherBearer).expect(200)

	await rq
		.put('/users/3')
		.set(otherBearer)
		.send({ email: 'arthur@email.com', password: '1234' })
		.expect(200)
})

test('[HAPPY] other methods pass through', async () => {
	await rq.options('/users/1').expect(200)
	await rq.head('/users/1').expect(200)
})
