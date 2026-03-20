# Data flow in Phase 1

Here is the full flow:

### Flashcard model

Schema defines the structure:

* word
* meaning
* level
* reading
* source
* etc.

### User model

Schema defines:

* login identity
* role
* XP
* level
* learned cards

### Import script

Reads:

* `backend/data/jlpt/N5.json`
* `backend/data/jlpt/N4.json`
* etc.

Then it:

1. connects to MongoDB
2. deletes old JLPT flashcards for that level
3. transforms JSON records into schema-shaped documents
4. inserts them into the `Flashcard` collection

So the schema and script work together like this:

* **Schema** = rules for the data
* **Script** = producer of the data
* **MongoDB** = storage for the data

---

# The main implementation idea behind Phase 1

This project is built with a clean separation:

* **Flashcard.js** defines what a learning item is
* **User.js** defines what a learner is
* **importJlptFlashcards.js** populates the database with vocabulary

That means the backend can stay consistent because every future route, controller, and frontend screen depends on these models being stable.


---

### Data flow in progress controller

1. frontend sends authenticated request
2. middleware sets `req.user`
3. controller finds the user in MongoDB
4. marks flashcard known if needed
5. awards XP
6. recalculates level
7. saves updated user document
8. returns fresh progress data to frontend

---

# Phase 2 summary

This backend layer works like this:

* **`server.js`** sets up the app and mounts the routers
* **`authMiddleware.js`** verifies identity and attaches the user
* **`progressController.js`** updates XP, level, and learning status in MongoDB

The main design principle here is:

**The backend is the source of truth.**
The frontend can request actions, but the backend decides what is valid and writes the real state to the database.

---


# Phase 3: The Bridge (API Services).


```jsx
import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL + "/api",
});

// Attach token automatically if present
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default API;

```

Here is **Phase 3: The Bridge (API Services)**.

---

# `frontend/src/services/api.js`

### Full code

```js
import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL + "/api",
});

// Attach token automatically if present
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default API;
```

---

## What this file does

This file creates a **shared Axios instance** for the whole frontend.

Instead of writing:

```js
axios.get(...)
axios.post(...)
axios.put(...)
```

everywhere with repeated token logic, the app centralizes all API behavior here.

This is the bridge between React and Express.

---

## Line-by-line explanation

### `import axios from "axios";`

Imports Axios, a promise-based HTTP client.

Why Axios is used:

* cleaner than raw `fetch`
* automatic JSON handling
* interceptors
* easier request/response management

---

### `const API = axios.create({ baseURL: process.env.REACT_APP_API_URL + "/api", });`

Creates a custom Axios instance.

Why it exists:

* all requests share the same base URL
* avoids repeating the backend origin in every call

Example:
If `REACT_APP_API_URL` is:

```js
http://localhost:5000
```

then `baseURL` becomes:

```js
http://localhost:5000/api
```

So later you can call:

```js
API.get("/flashcards")
```

instead of:

```js
axios.get("http://localhost:5000/api/flashcards")
```

That keeps the app cleaner and easier to maintain.

---

## Axios interceptor logic

### `API.interceptors.request.use(...)`

This is the key feature of the file.

A **request interceptor** runs **before every outgoing request**.

That means every time the frontend sends something to the backend, this code gets a chance to modify the request first.

---

### `const token = localStorage.getItem("token");`

Reads the stored JWT from browser localStorage.

Why it exists:

* after login, the app likely saves the token in localStorage
* this line retrieves it for authenticated requests

This is how the frontend remembers the user between page refreshes.

---

### `if (token) { config.headers.Authorization = \`Bearer ${token}`; }`

If the token exists, it adds an `Authorization` header.

This is the exact format the backend expects:

```http
Authorization: Bearer <token>
```

Why it exists:

* backend `authMiddleware.js` checks this header
* without it, protected routes will reject the request

So this line automatically makes every request authenticated when a token exists.

---

### `return config;`

Returns the modified request config.

Why it exists:

* Axios needs the final request object
* this allows the request to continue with the added token

---

### Error handler in interceptor

```js
(error) => Promise.reject(error)
```

Why it exists:

* if the interceptor itself fails, the request should be rejected properly
* keeps promise chains consistent

---

### `export default API;`

Exports the custom Axios instance so the rest of the frontend can use it.

This means components and services can do:

```js
API.get("/flashcards")
API.post("/progress/known", data)
```

---

# Why Axios interceptors matter here

Without interceptors, every protected request would need token code like this:

```js
const token = localStorage.getItem("token");
axios.get("/api/progress", {
  headers: {
    Authorization: `Bearer ${token}`
  }
});
```

That becomes repetitive very quickly.

With the interceptor:

* token logic is written once
* every request automatically includes the token
* fewer bugs
* cleaner components

---

# Data flow in this file

1. User logs in
2. Token is stored in `localStorage`
3. React component makes an API call through `API`
4. Interceptor runs before the request
5. Token is attached in the `Authorization` header
6. Backend `authMiddleware.js` verifies token
7. Request is accepted if valid

So this file is the quiet but essential connector between frontend state and backend security.

---

# Why this fits the architecture

This project separates responsibilities nicely:

* **backend middleware** decides whether a token is valid
* **frontend Axios interceptor** ensures the token is actually sent

That means authentication is handled consistently without repeating code in every component.

---


# Phase 4: The Interface (frontend/src/App.js and frontend/src/pages/Flashcards.js





