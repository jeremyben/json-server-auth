# 🔒 JSON Server Auth 🔓

JWT authentication middleware for **[JSON Server](https://github.com/typicode/json-server)**

Because you also need a **fake authentication flow** for your prototyping.

## Getting started

Install JSON Server Auth :

```bash
# NPM
npm install -D json-server-auth

# Yarn
yarn add -D json-server-auth
```

Create a `db.json` file with a `users` collection :

```json
{
	"users": []
}
```

Start JSON server (with JSON server Auth as middleware) :

```bash
json-server db.json -m ./node_modules/json-server-auth
# with json-server installed globally and json-server-auth installed locally
```

As a convenience, `json-server-auth` exposes `json-server` bundled with its middlewares :

```bash
json-server-auth db.json
# with json-server-auth installed globally
```

_It works the same for any flag._

## Authentication flow 🔑

JSON Server Auth adds a simple [JWT based](https://jwt.io/) authentication flow.

### Register 👥

Any of the following routes registers a new user :

-   **`POST /register`**
-   **`POST /signup`**
-   **`POST /users`**

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

-   **`POST /login`**
-   **`POST /signin`**

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

## Authorization flow 🛡️

_TODO_
