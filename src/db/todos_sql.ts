import mysql, { RowDataPacket } from "mysql2/promise";

type Client = mysql.Connection | mysql.Pool;

export const createTodoQuery = `-- name: CreateTodo :exec
INSERT INTO todos (
        id,
        user_id,
        title,
        description,
        is_done,
        priority,
        due_date
    )
VALUES (?, ?, ?, ?, ?, ?, ?)`;

export interface CreateTodoArgs {
    id: string;
    userId: string;
    title: string;
    description: string | null;
    isDone: number | null;
    priority: number | null;
    dueDate: Date | null;
}

export async function createTodo(client: Client, args: CreateTodoArgs): Promise<void> {
    await client.query({
        sql: createTodoQuery,
        values: [args.id, args.userId, args.title, args.description, args.isDone, args.priority, args.dueDate]
    });
}

export const getTodosByUserIdQuery = `-- name: GetTodosByUserId :many
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
WHERE user_id = ?`;

export interface GetTodosByUserIdArgs {
    userId: string;
}

export interface GetTodosByUserIdRow {
    id: string;
    userId: string;
    title: string;
    description: string | null;
    isDone: number | null;
    priority: number | null;
    dueDate: Date | null;
    createdAt: Date | null;
    updatedAt: Date | null;
}

export async function getTodosByUserId(client: Client, args: GetTodosByUserIdArgs): Promise<GetTodosByUserIdRow[]> {
    const [rows] = await client.query<RowDataPacket[]>({
        sql: getTodosByUserIdQuery,
        values: [args.userId],
        rowsAsArray: true
    });
    return rows.map(row => {
        return {
            id: row[0],
            userId: row[1],
            title: row[2],
            description: row[3],
            isDone: row[4],
            priority: row[5],
            dueDate: row[6],
            createdAt: row[7],
            updatedAt: row[8]
        };
    });
}

export const getTodoByIdQuery = `-- name: GetTodoById :one
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
WHERE id = ? AND user_id = ?`;

export interface GetTodoByIdArgs {
    id: string;
    userId: string;
}

export interface GetTodoByIdRow {
    id: string;
    userId: string;
    title: string;
    description: string | null;
    isDone: number | null;
    priority: number | null;
    dueDate: Date | null;
    createdAt: Date | null;
    updatedAt: Date | null;
}

export async function getTodoById(client: Client, args: GetTodoByIdArgs): Promise<GetTodoByIdRow | null> {
    const [rows] = await client.query<RowDataPacket[]>({
        sql: getTodoByIdQuery,
        values: [args.id, args.userId],
        rowsAsArray: true
    });
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        userId: row[1],
        title: row[2],
        description: row[3],
        isDone: row[4],
        priority: row[5],
        dueDate: row[6],
        createdAt: row[7],
        updatedAt: row[8]
    };
}

export const updateTodoQuery = `-- name: UpdateTodo :exec
UPDATE todos
SET title = ?,
    description = ?,
    is_done = ?,
    priority = ?,
    due_date = ?,
    updated_at = CURRENT_TIMESTAMP
WHERE id = ? AND user_id = ?`;

export interface UpdateTodoArgs {
    title: string;
    description: string | null;
    isDone: number | null;
    priority: number | null;
    dueDate: Date | null;
    id: string;
    userId: string;
}

export async function updateTodo(client: Client, args: UpdateTodoArgs): Promise<void> {
    await client.query({
        sql: updateTodoQuery,
        values: [args.title, args.description, args.isDone, args.priority, args.dueDate, args.id, args.userId]
    });
}

export const deleteTodoQuery = `-- name: DeleteTodo :exec
DELETE FROM todos
WHERE id = ? AND user_id = ?`;

export interface DeleteTodoArgs {
    id: string;
    userId: string;
}

export async function deleteTodo(client: Client, args: DeleteTodoArgs): Promise<void> {
    await client.query({
        sql: deleteTodoQuery,
        values: [args.id, args.userId]
    });
}

