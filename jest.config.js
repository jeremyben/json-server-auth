// @ts-check
// tslint:disable

// https://kulshekhar.github.io/ts-jest/user/config/
module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	// https://jestjs.io/docs/en/configuration.html#testpathignorepatterns-array-string
	testPathIgnorePatterns: ['/node_modules/', '/fixtures/', '/__tests__/shared/', '/.vscode/'],
	globals: {
		'ts-jest': {
			baseUrl: "http://localhost:3000",
			diagnostics: {
				// https://kulshekhar.github.io/ts-jest/user/config/diagnostics
				warnOnly: true,
			},
		},
	},
}
