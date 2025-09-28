import { RouteError } from '@src/common/route-errors';
import HttpStatusCodes from '@src/common/HttpStatusCodes';

import UserRepo from '@src/repos/UserRepo';
import { User } from '@src/models/User';
import { SearchUserRequest } from '@src/models/SearchUser';

// Enhanced error constants
export const USER_NOT_FOUND_ERR = 'User not found';
export const USER_ALREADY_EXISTS_ERR = 'User with this email already exists';
export const INVALID_USER_DATA_ERR = 'Invalid user data provided';
export const SEARCH_FAILED_ERR = 'Failed to search users';
export const CREATE_USER_FAILED_ERR = 'Failed to create user';
export const UPDATE_USER_FAILED_ERR = 'Failed to update user';
export const DELETE_USER_FAILED_ERR = 'Failed to delete user';

/**
 * Search users based on provided criteria with enhanced error handling
 */
async function search(request: SearchUserRequest): Promise<User[]> {
  try {
    // Validate search request
    if (!request || typeof request !== 'object') {
      throw new RouteError(
        HttpStatusCodes.BAD_REQUEST,
        'Invalid search parameters'
      );
    }

    const users = await UserRepo.search(request);
    return users || [];
  } catch (error) {
    if (error instanceof RouteError) {
      throw error;
    }
    throw new RouteError(
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      SEARCH_FAILED_ERR
    );
  }
}

/**
 * Add one user with validation and duplicate checking
 */
async function addOne(user: User): Promise<User> {
  try {
    // Enhanced input validation
    validateUserInput(user);
    
    // Check for existing user by email (if email field exists)
    if (user.email) {
      const existingUsers = await UserRepo.search({ email: user.email });
      if (existingUsers && existingUsers.length > 0) {
        throw new RouteError(
          HttpStatusCodes.CONFLICT,
          USER_ALREADY_EXISTS_ERR
        );
      }
    }

    const newUser = await UserRepo.add(user);
    return newUser;
  } catch (error) {
    if (error instanceof RouteError) {
      throw error;
    }
    throw new RouteError(
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      CREATE_USER_FAILED_ERR
    );
  }
}

/**
 * Get one user with enhanced validation
 */
async function getOne(id: number): Promise<User> {
  try {
    // Validate ID
    if (!isValidId(id)) {
      throw new RouteError(
        HttpStatusCodes.BAD_REQUEST,
        'Invalid user ID provided'
      );
    }

    const existingUser = await UserRepo.getOne(id);
    if (!existingUser) {
      throw new RouteError(
        HttpStatusCodes.NOT_FOUND,
        USER_NOT_FOUND_ERR,
      );
    }
    
    return existingUser;
  } catch (error) {
    if (error instanceof RouteError) {
      throw error;
    }
    throw new RouteError(
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      'Failed to retrieve user'
    );
  }
}

/**
 * Update one user with comprehensive validation
 */
async function updateOne(id: number, user: User): Promise<User> {
  try {
    // Validate inputs
    if (!isValidId(id)) {
      throw new RouteError(
        HttpStatusCodes.BAD_REQUEST,
        'Invalid user ID provided'
      );
    }

    validateUserInput(user, true); // Allow partial validation for updates

    // Check if user exists
    const existingUser = await UserRepo.getOne(id);
    if (!existingUser) {
      throw new RouteError(
        HttpStatusCodes.NOT_FOUND,
        USER_NOT_FOUND_ERR,
      );
    }

    // Check for email conflicts (if email is being updated)
    if (user.email && user.email !== existingUser.email) {
      const duplicateUsers = await UserRepo.search({ email: user.email });
      if (duplicateUsers && duplicateUsers.length > 0) {
        throw new RouteError(
          HttpStatusCodes.CONFLICT,
          USER_ALREADY_EXISTS_ERR
        );
      }
    }

    const updatedUser = await UserRepo.update(id, user);
    return updatedUser;
  } catch (error) {
    if (error instanceof RouteError) {
      throw error;
    }
    throw new RouteError(
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      UPDATE_USER_FAILED_ERR
    );
  }
}

/**
 * Delete a user by their id with enhanced validation
 */
async function _delete(id: number): Promise<void> {
  try {
    // Validate ID
    if (!isValidId(id)) {
      throw new RouteError(
        HttpStatusCodes.BAD_REQUEST,
        'Invalid user ID provided'
      );
    }

    // Check if user exists
    const existingUser = await UserRepo.getOne(id);
    if (!existingUser) {
      throw new RouteError(
        HttpStatusCodes.NOT_FOUND,
        USER_NOT_FOUND_ERR,
      );
    }

    // Perform soft delete or hard delete based on business rules
    await UserRepo.delete(id);
  } catch (error) {
    if (error instanceof RouteError) {
      throw error;
    }
    throw new RouteError(
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      DELETE_USER_FAILED_ERR
    );
  }
}

/**
 * Utility function to validate user input data
 */
function validateUserInput(user: User, isPartialUpdate: boolean = false): void {
  if (!user || typeof user !== 'object') {
    throw new RouteError(
      HttpStatusCodes.BAD_REQUEST,
      INVALID_USER_DATA_ERR
    );
  }

  // For full creation, require essential fields
  if (!isPartialUpdate) {
    if (!user.name || typeof user.name !== 'string' || user.name.trim().length === 0) {
      throw new RouteError(
        HttpStatusCodes.BAD_REQUEST,
        'User name is required and cannot be empty'
      );
    }

    if (!user.email || typeof user.email !== 'string' || !isValidEmail(user.email)) {
      throw new RouteError(
        HttpStatusCodes.BAD_REQUEST,
        'Valid email address is required'
      );
    }
  } else {
    // For updates, validate only provided fields
    if (user.name !== undefined && (typeof user.name !== 'string' || user.name.trim().length === 0)) {
      throw new RouteError(
        HttpStatusCodes.BAD_REQUEST,
        'User name cannot be empty'
      );
    }

    if (user.email !== undefined && (typeof user.email !== 'string' || !isValidEmail(user.email))) {
      throw new RouteError(
        HttpStatusCodes.BAD_REQUEST,
        'Invalid email address format'
      );
    }
  }
}

/**
 * Utility function to validate ID format
 */
function isValidId(id: number): boolean {
  return typeof id === 'number' && id > 0 && Number.isInteger(id);
}

/**
 * Utility function to validate email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Export with same method names as requested
export default {
  search,
  getOne,
  addOne,
  updateOne,
  delete: _delete,
} as const;

// Export utility functions for testing
export {
  validateUserInput,
  isValidId,
  isValidEmail,
};
