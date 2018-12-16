import * as supertest from 'supertest'
import { inMemoryJsonServer, USER } from './shared/tools'

let rq: supertest.SuperTest<supertest.Test>

beforeEach(async () => {
	const db = { users: [] }
	const app = inMemoryJsonServer(db)
	rq = supertest(app)
	// prettier-ignore
	await rq.post('/signup').send(USER)
})

describe('Register user', () => {
	test('[HAPPY] Register and return access token', () => {
		return rq
			.post('/register')
			.send({ email: 'albert@mail.com', password: 'azerty123', name: 'Albert' })
			.expect(201, /"accessToken": ".*"/)
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
			.expect(400, /incorrect email/i)
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
