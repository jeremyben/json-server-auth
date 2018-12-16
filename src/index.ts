import { RequestHandler } from 'express'
import guardsRouter from './guards'
import usersRouter from './users'

const middlewares: RequestHandler[] = [usersRouter, guardsRouter]

// export middlewares as is, so we can simply pass the module to json-server `--middlewares` flag
export = middlewares
