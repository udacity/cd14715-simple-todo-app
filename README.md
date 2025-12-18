# Simple Todo List App

A minimal todo list application for code review evaluation.

## Features

- Create, read, update, and delete todos
- Input validation and sanitization
- Secure database queries using parameterized statements
- Comprehensive test coverage

## Structure

- `src/todo.ts` - Main todo functionality with CRUD operations
- `src/database.ts` - Database interface
- `src/todo.test.ts` - Unit tests
- `fixtures/` - Code fixtures for evaluation

## Installation

```bash
npm install
```

## Running Tests

```bash
npm test
```

## Security

This application follows security best practices:
- Parameterized database queries to prevent SQL injection
- Input sanitization to prevent XSS attacks
- Input validation for data integrity
