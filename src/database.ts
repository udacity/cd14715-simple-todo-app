/**
 * Simple database interface for the todo app
 */

export interface Database {
  query(sql: string, params?: any[]): Promise<any[]>;
}

// Mock database for demonstration
class MockDatabase implements Database {
  private data: Map<string, any[]> = new Map();

  async query(sql: string, params: any[] = []): Promise<any[]> {
    // Simple mock implementation
    return [];
  }
}

export const db = new MockDatabase();
