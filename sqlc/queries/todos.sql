-- name: CreateTodo :exec
INSERT INTO todos (
        id,
        user_id,
        title,
        description,
        is_done,
        priority,
        due_date
    )
VALUES (?, ?, ?, ?, ?, ?, ?);
-- name: GetTodosByUserId :many
SELECT id,
    user_id,
    title,
    description,
    is_done,
    priority,
    due_date,
    created_at,
    updated_at
FROM todos
WHERE user_id = ?;
-- name: GetTodoById :one
SELECT id,
    user_id,
    title,
    description,
    is_done,
    priority,
    due_date,
    created_at,
    updated_at
FROM todos
WHERE id = ? AND user_id = ?;
-- name: UpdateTodo :exec
UPDATE todos
SET title = ?,
    description = ?,
    is_done = ?,
    priority = ?,
    due_date = ?,
    updated_at = CURRENT_TIMESTAMP
WHERE id = ? AND user_id = ?;

UPDATE todos
SET is_done = ?, updated_at = CURRENT_TIMESTAMP
WHERE id = ? AND user_id = ?;

-- name: DeleteTodo :exec
DELETE FROM todos
WHERE id = ? AND user_id = ?;