/**
 * Tests for todo list functionality
 */

import { validateTodoInput, sanitizeInput, createTodo, CreateTodoInput } from './todo';

describe('Todo List', () => {
  describe('validateTodoInput', () => {
    it('should return true for valid input', () => {
      const input: CreateTodoInput = {
        title: 'Buy groceries',
        description: 'Milk, eggs, bread'
      };
      expect(validateTodoInput(input)).toBe(true);
    });

    it('should return false for empty title', () => {
      const input: CreateTodoInput = {
        title: '',
        description: 'Some description'
      };
      expect(validateTodoInput(input)).toBe(false);
    });

    it('should return false for title exceeding 200 characters', () => {
      const input: CreateTodoInput = {
        title: 'a'.repeat(201),
        description: 'Some description'
      };
      expect(validateTodoInput(input)).toBe(false);
    });

    it('should return false for description exceeding 1000 characters', () => {
      const input: CreateTodoInput = {
        title: 'Valid title',
        description: 'a'.repeat(1001)
      };
      expect(validateTodoInput(input)).toBe(false);
    });
  });

  describe('sanitizeInput', () => {
    it('should escape HTML special characters', () => {
      const input = '<script>alert("xss")</script>';
      const sanitized = sanitizeInput(input);
      expect(sanitized).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
    });

    it('should escape single quotes', () => {
      const input = "It's a test";
      const sanitized = sanitizeInput(input);
      expect(sanitized).toContain('&#039;');
    });
  });
});
