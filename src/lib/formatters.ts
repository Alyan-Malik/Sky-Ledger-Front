// src/lib/formatters.ts

/**
 * Format time from ISO string to HH:MM
 */
export function formatTime(isoString: string): string {
  if (!isoString) return '--:--';
  
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '--:--';
    
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  } catch {
    return '--:--';
  }
}

/**
 * Format date from ISO string
 */
export function formatDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return '---';
  }
}

/**
 * Format duration string to readable format
 * Input: "PT2H30M" or "2h 30m"
 */
export function formatDuration(duration: string): string {
  if (!duration) return '--';
  
  try {
    // Duffel format: PT2H30M
    const isoMatch = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
    if (isoMatch) {
      const hours = parseInt(isoMatch[1] || '0');
      const minutes = parseInt(isoMatch[2] || '0');
      
      if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
      if (hours > 0) return `${hours}h`;
      if (minutes > 0) return `${minutes}m`;
      return '--';
    }
    
    // Already formatted like "2h 30m"
    return duration;
  } catch {
    return duration || '--';
  }
}

/**
 * Format currency
 */
export function formatCurrency(amount: number | string, currency: string = 'USD'): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount) || numAmount === null || numAmount === undefined) {
    return `${currency} 0.00`;
  }
  
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numAmount);
  } catch {
    return `${currency} ${numAmount.toFixed(2)}`;
  }
}
/**
 * Format number with commas
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

/**
 * Calculate duration between two dates in human-readable format
 */
export function getDurationBetween(start: string, end: string): string {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffMs = endDate.getTime() - startDate.getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
}

/**
 * Format cabin class for display
 */
export function formatCabinClass(cabinClass: string): string {
  const formats: Record<string, string> = {
    economy: 'Economy',
    premium_economy: 'Premium Economy',
    business: 'Business',
    first: 'First Class',
  };
  return formats[cabinClass] || cabinClass;
}

/**
 * Get time of day label
 */
export function getTimeOfDay(dateString: string): string {
  const hour = new Date(dateString).getHours();
  if (hour < 12) return 'Morning';
  if (hour < 17) return 'Afternoon';
  if (hour < 21) return 'Evening';
  return 'Night';
}