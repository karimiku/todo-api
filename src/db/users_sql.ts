import mysql, { RowDataPacket } from "mysql2/promise";

type Client = mysql.Connection | mysql.Pool;

export const createUserQuery = `-- name: CreateUser :exec
INSERT INTO users (id, email, password)
VALUES (?, ?, ?)`;

export interface CreateUserArgs {
    id: string;
    email: string;
    password: string;
}

export async function createUser(client: Client, args: CreateUserArgs): Promise<void> {
    await client.query({
        sql: createUserQuery,
        values: [args.id, args.email, args.password]
    });
}

export const getUserByEmailQuery = `-- name: GetUserByEmail :one
SELECT id,
    email,
    password,
    created_at
FROM users
WHERE email = ?`;

export interface GetUserByEmailArgs {
    email: string;
}

export interface GetUserByEmailRow {
    id: string;
    email: string;
    password: string;
    createdAt: Date | null;
}

export async function getUserByEmail(client: Client, args: GetUserByEmailArgs): Promise<GetUserByEmailRow | null> {
    const [rows] = await client.query<RowDataPacket[]>({
        sql: getUserByEmailQuery,
        values: [args.email],
        rowsAsArray: true
    });
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        email: row[1],
        password: row[2],
        createdAt: row[3]
    };
}

export const getUserByIdQuery = `-- name: GetUserById :one
SELECT id,
    email,
    password,
    created_at
FROM users
WHERE id = ?`;

export interface GetUserByIdArgs {
    id: string;
}

export interface GetUserByIdRow {
    id: string;
    email: string;
    password: string;
    createdAt: Date | null;
}

export async function getUserById(client: Client, args: GetUserByIdArgs): Promise<GetUserByIdRow | null> {
    const [rows] = await client.query<RowDataPacket[]>({
        sql: getUserByIdQuery,
        values: [args.id],
        rowsAsArray: true
    });
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        email: row[1],
        password: row[2],
        createdAt: row[3]
    };
}

