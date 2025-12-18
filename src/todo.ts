/**
 * Simple Todo List Application
 * Clean, secure implementation using modern TypeScript
 */

import { db } from './database';

export interface Todo {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: Date;
}

export interface CreateTodoInput {
  title: string;
  description: string;
}

/**
 * Validates todo input
 */
export function validateTodoInput(input: CreateTodoInput): boolean {
  if (!input.title || input.title.trim().length === 0) {
    return false;
  }
  if (input.title.length > 200) {
    return false;
  }
  if (input.description && input.description.length > 1000) {
    return false;
  }
  return true;
}

/**
 * Sanitizes user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Creates a new todo item
 */
export async function createTodo(input: CreateTodoInput): Promise<Todo> {
  if (!validateTodoInput(input)) {
    throw new Error('Invalid todo input');
  }

  const sanitizedTitle = sanitizeInput(input.title.trim());
  const sanitizedDescription = sanitizeInput(input.description || '');

  const todo: Todo = {
    id: generateId(),
    title: sanitizedTitle,
    description: sanitizedDescription,
    completed: false,
    createdAt: new Date()
  };

  // Use parameterized query to prevent SQL injection
  const query = 'INSERT INTO todos (id, title, description, completed, created_at) VALUES ($1, $2, $3, $4, $5)';
  const params = [todo.id, todo.title, todo.description, todo.completed, todo.createdAt];

  await db.query(query, params);

  return todo;
}

/**
 * Gets all todos
 */
export async function getAllTodos(): Promise<Todo[]> {
  const query = 'SELECT * FROM todos ORDER BY created_at DESC';
  const rows = await db.query(query);
  return rows as Todo[];
}

/**
 * Gets a todo by ID using parameterized query
 */
export async function getTodoById(id: string): Promise<Todo | null> {
  const query = 'SELECT * FROM todos WHERE id = $1';
  const rows = await db.query(query, [id]);

  if (rows.length === 0) {
    return null;
  }

  return rows[0] as Todo;
}

/**
 * Updates a todo's completed status
 */
export async function updateTodoStatus(id: string, completed: boolean): Promise<void> {
  const query = 'UPDATE todos SET completed = $1 WHERE id = $2';
  await db.query(query, [completed, id]);
}

/**
 * Deletes a todo by ID
 */
export async function deleteTodo(id: string): Promise<void> {
  const query = 'DELETE FROM todos WHERE id = $1';
  await db.query(query, [id]);
}

/**
 * Generates a unique ID
 */
function generateId(): string {
  return `todo_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}
