export interface ValidationError {
    field: string;
    message: string;
  }
  
  export type ValidationResult = {
    isValid: boolean;
    errors: ValidationError[];
  };
  
  export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  export const validatePassword = (password: string): boolean => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\w\W]{8,}$/;
    return passwordRegex.test(password);
  };
  
  export const validateName = (name: string): boolean => {
    return name.length >= 2 && name.length <= 50;
  };
  
  export const validateLoginForm = (email: string, password: string): ValidationResult => {
    const errors: ValidationError[] = [];
  
    if (!email) {
      errors.push({ field: 'email', message: 'Email is required' });
    } else if (!validateEmail(email)) {
      errors.push({ field: 'email', message: 'Invalid email format' });
    }
  
    if (!password) {
      errors.push({ field: 'password', message: 'Password is required' });
    }
  
    return {
      isValid: errors.length === 0,
      errors,
    };
  };
  
  export const validateRegistrationForm = (
    name: string,
    email: string,
    password: string,
    confirmPassword: string,
    phone?: string
  ): ValidationResult => {
    const errors: ValidationError[] = [];
  
    if (!name) {
      errors.push({ field: 'name', message: 'Name is required' });
    } else if (!validateName(name)) {
      errors.push({ field: 'name', message: 'Name must be between 2 and 50 characters' });
    }
  
    if (!email) {
      errors.push({ field: 'email', message: 'Email is required' });
    } else if (!validateEmail(email)) {
      errors.push({ field: 'email', message: 'Invalid email format' });
    }
  
    if (!password) {
      errors.push({ field: 'password', message: 'Password is required' });
    } else if (!validatePassword(password)) {
      errors.push({
        field: 'password',
        message: 'Password must be at least 8 characters with 1 uppercase, 1 lowercase, and 1 number',
      });
    }
  
    if (password !== confirmPassword) {
      errors.push({ field: 'confirmPassword', message: 'Passwords do not match' });
    }

    // Add phone validation
    if (phone) {
      // Allow only digits with optional country code (+) and spaces/dashes
      const phoneRegex = /^[+]?[\s./0-9]*[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/;
      if (!phoneRegex.test(phone)) {
        errors.push({
          field: 'phone',
          message: 'Please enter a valid phone number',
        });
      }
    }
  
    return {
      isValid: errors.length === 0,
      errors,
    };
  };
  
  export const validateLocationForm = (data: {
    name: string;
    area: number;
    totalTrees: number;
    soilType: string;
  }): ValidationResult => {
    const errors: ValidationError[] = [];
  
    if (!data.name) {
      errors.push({ field: 'name', message: 'Location name is required' });
    }
  
    if (!data.area || data.area <= 0) {
      errors.push({ field: 'area', message: 'Area must be greater than 0' });
    }
  
    if (!data.totalTrees || data.totalTrees <= 0) {
      errors.push({ field: 'totalTrees', message: 'Total trees must be greater than 0' });
    }
  
    if (!data.soilType) {
      errors.push({ field: 'soilType', message: 'Soil type is required' });
    }
  
    return {
      isValid: errors.length === 0,
      errors,
    };
  };