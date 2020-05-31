import { Handler } from 'express'
import guardsRouter, { rewriter } from './guards'
import usersRouter from './users'

interface MiddlewaresWithRewriter extends Array<Handler> {
	rewriter: typeof rewriter
}

// @ts-ignore shut the compiler up about defining in two steps
const middlewares: MiddlewaresWithRewriter = [usersRouter, guardsRouter]
Object.defineProperty(middlewares, 'rewriter', { value: rewriter, enumerable: false })

// export middlewares as is, so we can simply pass the module to json-server `--middlewares` flag
export = middlewares
