-- name: CreateUser :exec
INSERT INTO users (id, email, password)
VALUES (?, ?, ?);
-- name: GetUserByEmail :one
SELECT id,
    email,
    password,
    created_at
FROM users
WHERE email = ?;
-- name: GetUserById :one
SELECT id,
    email,
    password,
    created_at
FROM users
WHERE id = ?;