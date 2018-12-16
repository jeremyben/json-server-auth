#!/usr/bin/env node

// tslint:disable:no-submodule-imports
import * as yargs from 'yargs'
import * as jsonServerPkg from 'json-server/package.json'
import run = require('json-server/lib/cli/run')

// Get the json-server cli module and add our middlewares.
// It's inside a closure in the json-server source code, so we unfortunately have to duplicate it.
// https://github.com/typicode/json-server/blob/master/src/cli/index.js

const argv = yargs
	.config('config')
	.usage('$0 [options] <source>')
	.options({
		port: { alias: 'p', description: 'Set port', default: 3000 },
		host: { alias: 'H', description: 'Set host', default: 'localhost' },
		watch: { alias: 'w', description: 'Watch file(s)' },
		routes: { alias: 'r', description: 'Path to routes file' },
		middlewares: { alias: 'm', array: true, description: 'Paths to middleware files' },
		static: { alias: 's', description: 'Set static files directory' },
		'read-only': { alias: 'ro', description: 'Allow only GET requests' },
		'no-cors': { alias: 'nc', description: 'Disable Cross-Origin Resource Sharing' },
		'no-gzip': { alias: 'ng', description: 'Disable GZIP Content-Encoding' },
		snapshots: { alias: 'S', description: 'Set snapshots directory', default: '.' },
		delay: { alias: 'd', description: 'Add delay to responses (ms)' },
		id: { alias: 'i', description: 'Set database id property (e.g. _id)', default: 'id' },
		foreignKeySuffix: {
			alias: 'fks',
			description: 'Set foreign key suffix (e.g. _id as in post_id)',
			default: 'Id',
		},
		quiet: { alias: 'q', description: 'Suppress log messages from output' },
		config: { alias: 'c', description: 'Path to config file', default: 'json-server.json' },
	})
	.boolean('watch')
	.boolean('read-only')
	.boolean('quiet')
	.boolean('no-cors')
	.boolean('no-gzip')
	.help('help')
	.alias('help', 'h')
	.version(jsonServerPkg.version)
	.alias('version', 'v')
	.example('$0 db.json', '')
	.example('$0 file.js', '')
	.example('$0 http://example.com/db.json', '')
	.epilog(
		'https://github.com/typicode/json-server\nhttps://github.com/jeremyben/json-server-auth'
	)
	.require(1, 'Missing <source> argument').argv

// Add our index path to json-server middlewares.

if (argv.middlewares) {
	;(<string[]>argv.middlewares).unshift(__dirname)
} else {
	;(<string[]>argv.middlewares) = [__dirname]
}

run(argv)
