/**
 * Common date utilities for the application
 */

/**
 * Format a date as a string with various options
 */
export const formatDate = (
    date: Date | string,
    format: 'full' | 'date' | 'time' | 'dateTime' | 'monthDay' | 'weekday' = 'full'
  ): string => {
    const dateObj = date instanceof Date ? date : new Date(date);
    
    if (isNaN(dateObj.getTime())) {
      return 'Invalid date';
    }
    
    switch (format) {
      case 'date':
        return dateObj.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
      case 'time':
        return dateObj.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        });
      case 'dateTime':
        return `${formatDate(dateObj, 'date')} at ${formatDate(dateObj, 'time')}`;
      case 'monthDay':
        return dateObj.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        });
      case 'weekday':
        return dateObj.toLocaleDateString('en-US', {
          weekday: 'short',
        });
      case 'full':
      default:
        return dateObj.toLocaleDateString('en-US', {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        });
    }
  };
  
  /**
   * Get relative time string (e.g., "2 days ago", "in 3 hours")
   */
  export const getRelativeTimeString = (date: Date | string): string => {
    const dateObj = date instanceof Date ? date : new Date(date);
    const now = new Date();
    const diffMs = dateObj.getTime() - now.getTime();
    const diffSecs = Math.round(diffMs / 1000);
    const diffMins = Math.round(diffSecs / 60);
    const diffHours = Math.round(diffMins / 60);
    const diffDays = Math.round(diffHours / 24);
  
    const isFuture = diffMs > 0;
    const isSameDay = dateObj.setHours(0, 0, 0, 0) === now.setHours(0, 0, 0, 0);
    
    // Handle same day
    if (isSameDay) {
      if (Math.abs(diffHours) < 1) {
        if (Math.abs(diffMins) < 1) {
          return 'just now';
        }
        return isFuture 
          ? `in ${Math.abs(diffMins)} minute${Math.abs(diffMins) === 1 ? '' : 's'}`
          : `${Math.abs(diffMins)} minute${Math.abs(diffMins) === 1 ? '' : 's'} ago`;
      }
      return isFuture
        ? `in ${Math.abs(diffHours)} hour${Math.abs(diffHours) === 1 ? '' : 's'}`
        : `${Math.abs(diffHours)} hour${Math.abs(diffHours) === 1 ? '' : 's'} ago`;
    }
    
    // Handle different day
    if (Math.abs(diffDays) === 1) {
      return isFuture ? 'tomorrow' : 'yesterday';
    }
    
    if (Math.abs(diffDays) < 7) {
      return isFuture
        ? `in ${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? '' : 's'}`
        : `${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? '' : 's'} ago`;
    }
    
    // For dates more than a week away, just show the date
    return formatDate(dateObj, 'date');
  };
  
  /**
   * Check if a date is today
   */
  export const isToday = (date: Date | string): boolean => {
    const dateObj = date instanceof Date ? date : new Date(date);
    const today = new Date();
    return (
      dateObj.getDate() === today.getDate() &&
      dateObj.getMonth() === today.getMonth() &&
      dateObj.getFullYear() === today.getFullYear()
    );
  };
  
  /**
   * Check if a date is in the past
   */
  export const isPast = (date: Date | string): boolean => {
    const dateObj = date instanceof Date ? date : new Date(date);
    return dateObj < new Date();
  };
  
  /**
   * Get start and end of a time period
   */
  export const getDateRange = (
    period: 'today' | 'week' | 'month' | 'year',
    referenceDate: Date = new Date()
  ): { startDate: Date; endDate: Date } => {
    const start = new Date(referenceDate);
    const end = new Date(referenceDate);
    
    switch (period) {
      case 'today':
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case 'week':
        // Set to beginning of current week (Sunday)
        start.setDate(start.getDate() - start.getDay());
        start.setHours(0, 0, 0, 0);
        
        // Set to end of current week (Saturday)
        end.setDate(end.getDate() + (6 - end.getDay()));
        end.setHours(23, 59, 59, 999);
        break;
      case 'month':
        // Set to first day of current month
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        
        // Set to last day of current month
        end.setMonth(end.getMonth() + 1);
        end.setDate(0);
        end.setHours(23, 59, 59, 999);
        break;
      case 'year':
        // Set to first day of current year
        start.setMonth(0, 1);
        start.setHours(0, 0, 0, 0);
        
        // Set to last day of current year
        end.setMonth(11, 31);
        end.setHours(23, 59, 59, 999);
        break;
    }
    
    return { startDate: start, endDate: end };
  };
  
  /**
   * Format a date range as a string
   */
  export const formatDateRange = (startDate: Date, endDate: Date): string => {
    // Same day
    if (
      startDate.getFullYear() === endDate.getFullYear() &&
      startDate.getMonth() === endDate.getMonth() &&
      startDate.getDate() === endDate.getDate()
    ) {
      return `${formatDate(startDate, 'date')}`;
    }
    
    // Same month
    if (
      startDate.getFullYear() === endDate.getFullYear() &&
      startDate.getMonth() === endDate.getMonth()
    ) {
      return `${startDate.getDate()} - ${formatDate(endDate, 'date')}`;
    }
    
    // Same year
    if (startDate.getFullYear() === endDate.getFullYear()) {
      return `${formatDate(startDate, 'monthDay')} - ${formatDate(endDate, 'date')}`;
    }
    
    // Different years
    return `${formatDate(startDate, 'date')} - ${formatDate(endDate, 'date')}`;
  };
  
  /**
   * Get date for next day of week (e.g., next Monday)
   */
  export const getNextDayOfWeek = (
    dayOfWeek: number,  // 0 = Sunday, 1 = Monday, etc.
    referenceDate: Date = new Date()
  ): Date => {
    const resultDate = new Date(referenceDate);
    resultDate.setDate(
      referenceDate.getDate() + (7 + dayOfWeek - referenceDate.getDay()) % 7
    );
    return resultDate;
  };
  
  /**
   * Get age in years from date
   */
  export const getAgeInYears = (date: Date | string): number => {
    const birthDate = date instanceof Date ? date : new Date(date);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    
    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    
    return age;
  };
  
  /**
   * Add time to date
   */
  export const addTime = (
    date: Date | string,
    amount: number,
    unit: 'minutes' | 'hours' | 'days' | 'weeks' | 'months' | 'years'
  ): Date => {
    const resultDate = date instanceof Date ? new Date(date) : new Date(date);
    
    switch (unit) {
      case 'minutes':
        resultDate.setMinutes(resultDate.getMinutes() + amount);
        break;
      case 'hours':
        resultDate.setHours(resultDate.getHours() + amount);
        break;
      case 'days':
        resultDate.setDate(resultDate.getDate() + amount);
        break;
      case 'weeks':
        resultDate.setDate(resultDate.getDate() + amount * 7);
        break;
      case 'months':
        resultDate.setMonth(resultDate.getMonth() + amount);
        break;
      case 'years':
        resultDate.setFullYear(resultDate.getFullYear() + amount);
        break;
    }
    
    return resultDate;
  };
  
  /**
   * Format a duration in minutes to a readable string
   */
  export const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} minute${minutes === 1 ? '' : 's'}`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) {
      return `${hours} hour${hours === 1 ? '' : 's'}`;
    }
    
    return `${hours} hour${hours === 1 ? '' : 's'} ${remainingMinutes} minute${
      remainingMinutes === 1 ? '' : 's'
    }`;
  };