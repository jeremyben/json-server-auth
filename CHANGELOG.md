# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [2.1.0](https://github.com/jeremyben/json-server-auth/compare/v2.0.2...v2.1.0) (2021-07-21)


### Features

* register and login return user data besides access token ([5af16c9](https://github.com/jeremyben/json-server-auth/commit/5af16c940e8a41b0bd81c478813827561eb2d5b9))


### Bug Fixes

* bin path and peer dependency version ([89af19e](https://github.com/jeremyben/json-server-auth/commit/89af19ef636136d8db389879857282cfc6a1636f))
* put and patch on user collection ([4382ef1](https://github.com/jeremyben/json-server-auth/commit/4382ef1a41dfa90734719eb2cc163c355ec0d733))

### [2.0.2](https://github.com/jeremyben/json-server-auth/compare/v2.0.1...v2.0.2) (2020-06-01)


### Bug Fixes

* allow other HTTP methods like OPTIONS to pass through guards ([7b8d1a0](https://github.com/jeremyben/json-server-auth/commit/7b8d1a0fe9d12b4d527b3a795d4aed9fdcf07961))

### [2.0.1](https://github.com/jeremyben/json-server-auth/compare/v2.0.0...v2.0.1) (2020-06-01)


### Bug Fixes

* allow user creation on users route after setting guards ([a29ec45](https://github.com/jeremyben/json-server-auth/commit/a29ec452141f79fc5967538d4a852b3462f2b928))

## [2.0.0](https://github.com/jeremyben/json-server-auth/compare/v1.2.1...v2.0.0) (2020-05-31)


### ⚠ BREAKING CHANGES

* well it's no longer a direct dependency

### Bug Fixes

* LF end of line ([ed2483c](https://github.com/jeremyben/json-server-auth/commit/ed2483c53e6082f5beed6c758f9080218643ecbd))
* move json-server as a peer depency, remove express as direct dependency (already in json-server) ([a4edcdc](https://github.com/jeremyben/json-server-auth/commit/a4edcdcdffcbb2015a43f5cb8c80190a112e5a41))

### [1.2.1](https://github.com/jeremyben/json-server-auth/compare/v1.2.0...v1.2.1) (2019-06-15)


### Bug Fixes

* unique constraint on user email ([eb47b25](https://github.com/jeremyben/json-server-auth/commit/eb47b252612628b03821876db62bf6ed5ba1490f))

### [1.2.0](https://github.com/jeremyben/json-server-auth/compare/v1.1.0...v1.2.0) (2019-05-11)


### Features

* custom rewriter is now accessible from the module root ([4fbdf70](https://github.com/jeremyben/json-server-auth/commit/4fbdf70bc72119ff79ee8a686162e62020a64bb8))

### Bug Fixes

* compiler errors and missing flag in cli bin ([51546eb](https://github.com/jeremyben/json-server-auth/commit/51546ebe05f1d1300b6debc7eb5e0850f4fd1add))
* users put route would not validate properly email and password ([d3b73d3](https://github.com/jeremyben/json-server-auth/commit/d3b73d3f6e9d5479de6ba6a07f0eabf17f0c2cf8))

### [1.1.0](https://github.com/jeremyben/json-server-auth/compare/v1.0.0...v1.1.0) (2018-12-24)


### Features

* convenient guards rewriter ([d41c29e](https://github.com/jeremyben/json-server-auth/commit/d41c29e6fb49a51df278f4ecfbe268c94596955b))

## 1.0.0 (2018-12-17)


### Features

* users router, guards router, cli ([deb84ab](https://github.com/jeremyben/json-server-auth/commit/deb84abd65fcc95c10c6b3e5968d9495e4acf0d4))
