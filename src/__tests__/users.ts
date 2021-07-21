import * as supertest from 'supertest'
import { inMemoryJsonServer, USER } from './shared/tools'

let rq: supertest.SuperTest<supertest.Test>

beforeEach(async () => {
	const db = { users: [] }
	const app = inMemoryJsonServer(db)
	rq = supertest(app)
	await rq.post('/signup').send(USER)
})

describe('Register user', () => {
	test('[HAPPY] Register and return access token and user', async () => {
		const res = await rq
			.post('/register')
			.send({ email: 'albert@mail.com', password: 'azerty123', name: 'Albert' })

		expect(res.status).toBe(201)
		expect(res.body.accessToken).toMatch(/^[\w-]*\.[\w-]*\.[\w-]*$/)
		expect(res.body.user).toStrictEqual({ id: 2, email: 'albert@mail.com', name: 'Albert' })
	})

	test('[SAD] Bad email', () => {
		return rq
			.post('/register')
			.send({ email: 'albert@', password: 'azerty123' })
			.expect(400, /email format/i)
	})

	test('[SAD] Lack password', () => {
		return rq
			.post('/register')
			.send({ email: 'albert@mail.com' })
			.expect(400, /required/i)
	})

	test('[SAD] Email already exists', () => {
		return rq
			.post('/register')
			.send({ email: 'jeremy@mail.com', password: 'azerty123' })
			.expect(400, /already/i)
	})

	test('Alternative routes', async () => {
		const signupRes = await rq.post('/signup')
		expect(signupRes.notFound).toBe(false)
		expect(signupRes.badRequest).toBe(true)

		const usersRes = await rq.post('/users')
		expect(usersRes.notFound).toBe(false)
		expect(usersRes.badRequest).toBe(true)
	})
})

describe('Login user', () => {
	test('[HAPPY] Login and return access token', () => {
		return rq
			.post('/login')
			.send(USER)
			.expect(200, /"accessToken": ".*"/)
	})

	test('[SAD] User does not exist', () => {
		return rq
			.post('/login')
			.send({ ...USER, email: 'arthur@mail.com' })
			.expect(400, /cannot find user/i)
	})

	test('[SAD] Wrong password', () => {
		return rq
			.post('/login')
			.send({ ...USER, password: '172450' })
			.expect(400, /incorrect password/i)
	})

	test('Alternative route', async () => {
		const signinRes = await rq.post('/signin')
		expect(signinRes.notFound).toBe(false)
		expect(signinRes.badRequest).toBe(true)
	})
})

describe('Query user', () => {
	test('[HAPPY] List users', async () => {
		const res = await rq.get('/users')
		expect(res.ok).toBe(true)
		expect(res.body).toHaveLength(1)
		expect(res.body[0]).toMatchObject({ email: 'jeremy@mail.com' })
	})
})

describe('Update user', () => {
	test('[HAPPY] update name', () => {
		return rq
			.patch('/users/1')
			.send({ name: 'Arthur' })
			.expect(200, /"name": "Arthur"/)
	})

	test('[HAPPY] add other property', () => {
		return rq
			.patch('/users/1')
			.send({ age: 20 })
			.expect(200, /"age": 20/)
	})

	test('[HAPPY] modify email', () => {
		return rq.patch('/users/1').send({ email: 'arthur@mail.com' }).expect(200)
	})

	test('[HAPPY] modify and hash new password', async () => {
		const password = '965dsd3si'
		const { body, status } = await rq.patch('/users/1').send({ password })

		expect(status).toBe(200)
		expect(body.password).not.toBe(password)
	})

	test('[SAD] modify email with wrong input', () => {
		return rq
			.patch('/users/1')
			.send({ email: 'arthur' })
			.expect(400, /email format/i)
	})

	test('[SAD] Put with only one property', () => {
		return rq
			.put('/users/1')
			.send({ email: 'arthur@mail.com' })
			.expect(400, /required/i)
	})
})
