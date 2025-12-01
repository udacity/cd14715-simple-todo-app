/**
 * EVAL FIXTURE: Clean Code (Control)
 * 
 * Expected Detection:
 * - Overall score should be >= 85
 * - No critical or high severity issues
 * - May have minor suggestions (info level)
 */

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

export interface CreateUserInput {
  email: string;
  name: string;
}

/**
 * Validates email format using standard regex
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
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
 * Creates a new user with validated input
 */
export async function createUser(input: CreateUserInput): Promise<User> {
  // Validate input
  if (!input.email || !input.name) {
    throw new Error('Email and name are required');
  }

  if (!isValidEmail(input.email)) {
    throw new Error('Invalid email format');
  }

  // Sanitize input
  const sanitizedName = sanitizeInput(input.name);

  // Create user object
  const user: User = {
    id: generateId(),
    email: input.email.toLowerCase(),
    name: sanitizedName,
    createdAt: new Date()
  };

  // Save to database (using parameterized query)
  await saveUser(user);

  return user;
}

/**
 * Generates a unique ID
 */
function generateId(): string {
  return `user_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Saves user to database with parameterized query
 */
async function saveUser(user: User): Promise<void> {
  // Using parameterized query - safe from SQL injection
  const query = 'INSERT INTO users (id, email, name, created_at) VALUES ($1, $2, $3, $4)';
  const params = [user.id, user.email, user.name, user.createdAt];
  
  // await db.query(query, params);
}

