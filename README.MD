# 🔐 JSON Server Auth

JWT authentication middleware for **[JSON Server](https://github.com/typicode/json-server)**

Because you also need a fake **authentication & authorization flow** for your prototyping.

## Getting started

Install **both** JSON Server and JSON Server Auth :

```bash
# NPM
npm install -D json-server json-server-auth

# Yarn
yarn add -D json-server json-server-auth
```

Create a `db.json` file with a `users` collection :

```json
{
  "users": []
}
```

Start JSON server (with _JSON server Auth_ as middleware) :

```bash
json-server db.json -m ./node_modules/json-server-auth
# with json-server installed globally and json-server-auth installed locally
```

##### 📢 but wait !

As a convenience, **`json-server-auth`** CLI exposes `json-server` bundled with its middlewares :

```bash
json-server-auth db.json
# with json-server-auth installed globally
```

_It exposes and works the same for all [JSON Server flags](https://github.com/typicode/json-server#cli-usage)._

## Authentication flow 🔑

JSON Server Auth adds a simple [JWT based](https://jwt.io/) authentication flow.

### Register 👥

Any of the following routes registers a new user :

- **`POST /register`**
- **`POST /signup`**
- **`POST /users`**

**`email`** and **`password`** are required in the request body :

```http
POST /register
{
  "email": "olivier@mail.com",
  "password": "bestPassw0rd"
}
```

The password is encrypted by [bcryptjs](https://github.com/dcodeIO/bcrypt.js).
The response contains the JWT access token (expiration time of 1 hour) :

```http
201 Created
{
  "accessToken": "xxx.xxx.xxx"
}
```

###### Other properties

Any other property can be added to the request body without being validated :

```http
POST /register
{
  "email": "olivier@mail.com",
  "password": "bestPassw0rd",
  "firstname": "Olivier",
  "lastname": "Monge",
  "age": 32
}
```

###### Update

Any update to an existing user (via `PATCH` or `PUT` methods) will go through the same process for `email` and `password`.

### Login 🛂

Any of the following routes logs an existing user in :

- **`POST /login`**
- **`POST /signin`**

**`email`** and **`password`** are required, of course :

```http
POST /login
{
  "email": "olivier@mail.com",
  "password": "bestPassw0rd"
}
```

The response contains the JWT access token (expiration time of 1 hour) :

```http
200 OK
{
  "accessToken": "xxx.xxx.xxx"
}
```

#### JWT payload 📇

The access token has the following claims :

- **`sub` :** the user `id` (as per the [JWT specs](https://tools.ietf.org/html/rfc7519#section-4.1.2)).
- **`email` :** the user `email`.

## Authorization flow 🛡️

JSON Server Auth provides generic guards as **route middlewares**.

To handle common use cases, JSON Server Auth draws inspiration from **Unix filesystem permissions**, especialy the [numeric notation](https://en.wikipedia.org/wiki/File_system_permissions#Numeric_notation).

- We add **`4`** for **read** permission.
- We add **`2`** for **write** permission.

_Of course CRUD is not a filesystem, so we don't add 1 for execute permission._

Similarly to Unix, we then have three digits to match each user type :

- First digit are the permissions for the **resource owner**.
- Second digit are the permissions for the **logged-in users**.
- Third digit are the permissions for the **public users**.

For example, **`640`** means that only the owner can write the resource, logged-in users can read the resource, and public users cannot access the resource at all.

#### The resource owner 🛀

A user is the owner of a resource if that resource has a **`userId`** property that matches his `id` property. Example:

```js
// The owner of
{ id: 8, text: 'blabla', userId: 1 }
// is
{ id: 1, email: 'olivier@mail.com' }
```

Private guarded routes will use the JWT `sub` claim (which equals the user `id`) to check if the user actually owns the requested resource, by comparing `sub` with the `userId` property.

_Except for the actual `users` collection, where the JWT `sub` claim must match the `id` property._

### Guarded routes 🚥

Guarded routes exist at the root and can restrict access to any resource you put after them :

|    Route     | Resource permissions                                                                                 |
| :----------: | :--------------------------------------------------------------------------------------------------- |
| **`/664/*`** | User must be logged to _write_ the resource. <br> Everyone can _read_ the resource.                  |
| **`/660/*`** | User must be logged to _write_ or _read_ the resource.                                               |
| **`/644/*`** | User must own the resource to _write_ the resource. <br> Everyone can _read_ the resource.           |
| **`/640/*`** | User must own the resource to _write_ the resource. <br> User must be logged to _read_ the resource. |
| **`/600/*`** | User must own the resource to _write_ or _read_ the resource.                                        |
| **`/444/*`** | No one can _write_ the resource. <br> Everyone can _read_ the resource.                              |
| **`/440/*`** | No one can _write_ the resource. <br> User must be logged to _read_ the resource.                    |
| **`/400/*`** | No one can _write_ the resource. <br> User must own the resource to _read_ the resource.             |

#### Examples

- Public user (not logged-in) does the following requests : 

| _Request_                               | _Response_         |
| :-------------------------------------- | :----------------- |
| `GET /664/posts`                        | `200 OK`           |
| `POST /664/posts`<br>`{text: 'blabla'}` | `401 UNAUTHORIZED` |

- Logged-in user with `id: 1` does the following requests :

| _Request_                                                  | _Response_      |
| :--------------------------------------------------------- | :-------------- |
| `GET /600/users/1`<br>`Authorization: Bearer xxx.xxx.xxx`  | `200 OK`        |
| `GET /600/users/23`<br>`Authorization: Bearer xxx.xxx.xxx` | `403 FORBIDDEN` |

### Setup permissions 💡

Of course, you don't want to directly use guarded routes in your requests.
We can take advantage of [JSON Server custom routes feature](https://github.com/typicode/json-server#add-custom-routes) to setup resource permissions ahead.

Create a `routes.json` file :

```json
{
  "/users*": "/600/users$1",
  "/messages*": "/640/messages$1"
}
```

Then :

```bash
json-server db.json -m ./node_modules/json-server-auth -r routes.json
# with json-server installed globally and json-server-auth installed locally
```

##### 📢 but wait !

As a convenience, **`json-server-auth`** CLI allows you to define permissions in a more succinct way :

```json
{
  "users": 600,
  "messages": 640
}
```

Then :

```bash
json-server-auth db.json -r routes.json
# with json-server-auth installed globally
```

You can still add any other _normal_ custom routes :

```json
{
  "users": 600,
  "messages": 640,
  "/posts/:category": "/posts?category=:category"
}
```

## Module usage 🔩

If you go the programmatic way and [use JSON Server as a module](https://github.com/typicode/json-server#module), there is an extra step to properly integrate JSON Server Auth :

⚠️ You must bind the router property `db` to the created app, like the [JSON Server CLI does](https://github.com/typicode/json-server/blob/master/src/cli/run.js#L74), and you must apply the middlewares in a specific order.

```js
const jsonServer = require('json-server')
const auth = require('json-server-auth')

const app = jsonServer.create()
const router = jsonServer.router('db.json')

// /!\ Bind the router db to the app
app.db = router.db

// You must apply the auth middleware before the router
app.use(auth)
app.use(router)
app.listen(3000)
```

#### Permisssions Rewriter

The custom rewriter is accessible via a subproperty :

```js
const auth = require('json-server-auth')

const rules = auth.rewriter({
  // Permission rules
  users: 600,
  messages: 640,
  // Other rules
  '/posts/:category': '/posts?category=:category',
})

// You must apply the middlewares in the following order
app.use(rules)
app.use(auth)
app.use(router)
```

## TODO 📜

- [ ] Use JSON Server `id` and `foreignKeySuffix` parameters
- [ ] Handle query params in list requests to secure guarded routes more precisely
- [ ] Allow configuration of :
  - [ ] Users collection name
  - [ ] Minimum password length
  - [ ] JWT expiry time
  - [ ] JWT property name in response
- [ ] Implement JWT Refresh Token
- [ ] Possibility to disable password encryption ?
