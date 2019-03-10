import { randomBytes } from 'crypto'

const rndHex = randomBytes(
	Math.ceil(6/2)
).toString('hex').slice(0, 6)

export const secret: string =  `json-server-${rndHex}`

export const minPassLength: number = 4

export const saltLength: number = 10

export const emailRegex: RegExp = new RegExp(
	"^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$"
)

const jwt: JwtConfig = {
  expiresIn: '1h'
}

const config: AuthConfig = {
	jwt,
	secret,
	minPassLength,
	saltLength,
	emailRegex
}

export default config
