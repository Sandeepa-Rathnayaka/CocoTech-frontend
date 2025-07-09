import api from './axios';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface UpdateUserData {
  name?: string;
  email?: string;
  password?: string;
  phone?: string;  // Add phone field
}

interface UserResponse {
  status: string;
  data: {
    user: User;
  };
}

// New interface for profile response
export interface ProfileResponse {
  status: string;
  data: {
    user: {
      _id: string;
      name: string;
      email: string;
      isActive: boolean;
      phone: string;
    };
  };
}

export const getCurrentUser = async (): Promise<User> => {
  try {
    const response = await api.get<UserResponse>('/users/me');
    return response.data.data.user;
  } catch (error) {
    throw error;
  }
};

export const updateProfile = async (userData: UpdateUserData): Promise<User> => {
  try {
    const response = await api.put<UserResponse>('users/profile', userData);
    return response.data.data.user;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

export const changePassword = async (
  currentPassword: string,
  newPassword: string
): Promise<void> => {
  try {
    await api.post('/users/change-password', {
      currentPassword,
      newPassword,
    });
  } catch (error) {
    throw error;
  }
};

// Admin only endpoints
export const getAllUsers = async (): Promise<User[]> => {
  try {
    const response = await api.get<{ status: string; data: { users: User[] } }>(
      '/users'
    );
    return response.data.data.users;
  } catch (error) {
    throw error;
  }
};

export const getUserById = async (userId: string): Promise<User> => {
  try {
    const response = await api.get<UserResponse>(`/users/${userId}`);
    return response.data.data.user;
  } catch (error) {
    throw error;
  }
};

export const updateUser = async (
  userId: string,
  userData: UpdateUserData
): Promise<User> => {
  try {
    const response = await api.put<UserResponse>(`/users/${userId}`, userData);
    return response.data.data.user;
  } catch (error) {
    throw error;
  }
};

export const deleteUser = async (userId: string): Promise<void> => {
  try {
    await api.delete(`/users/${userId}`);
  } catch (error) {
    throw error;
  }
};

/**
 * Get current user profile
 * Fetches the authenticated user's profile information
 */
export const getProfile = async (): Promise<ProfileResponse['data']['user']> => {
  try {
    const response = await api.get<ProfileResponse>('users/profile');
    return response.data.data.user;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};