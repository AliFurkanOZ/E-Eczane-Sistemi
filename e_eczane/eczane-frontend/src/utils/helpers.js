/**
 * Helper utility functions
 */

import { format, formatDistance, formatRelative } from 'date-fns';
import { tr } from 'date-fns/locale';

/**
 * Format currency (Turkish Lira)
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
  }).format(amount);
};

/**
 * Format date
 */
export const formatDate = (date, formatStr = 'dd/MM/yyyy') => {
  if (!date) return '';
  return format(new Date(date), formatStr, { locale: tr });
};

/**
 * Format datetime
 */
export const formatDateTime = (date) => {
  if (!date) return '';
  return format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: tr });
};

/**
 * Format relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (date) => {
  if (!date) return '';
  return formatDistance(new Date(date), new Date(), {
    addSuffix: true,
    locale: tr,
  });
};

/**
 * Format relative date (e.g., "today at 3:00 PM")
 */
export const formatRelativeDate = (date) => {
  if (!date) return '';
  return formatRelative(new Date(date), new Date(), { locale: tr });
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Capitalize first letter
 */
export const capitalizeFirst = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Get initials from name
 */
export const getInitials = (name) => {
  if (!name) return '';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

/**
 * Validate email
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number (Turkish format)
 */
export const isValidPhone = (phone) => {
  const phoneRegex = /^(\+90|0)?[1-9][0-9]{9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

/**
 * Validate TC Kimlik No
 */
export const isValidTCKN = (tckn) => {
  if (!/^[1-9][0-9]{10}$/.test(tckn)) return false;
  
  const digits = tckn.split('').map(Number);
  const sum1 = (digits[0] + digits[2] + digits[4] + digits[6] + digits[8]) * 7;
  const sum2 = digits[1] + digits[3] + digits[5] + digits[7];
  const check1 = (sum1 - sum2) % 10;
  const check2 = digits.slice(0, 10).reduce((a, b) => a + b) % 10;
  
  return check1 === digits[9] && check2 === digits[10];
};

/**
 * Format phone number (Turkish format)
 */
export const formatPhoneNumber = (phone) => {
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{2})(\d{2})$/);
  if (match) {
    return `(${match[1]}) ${match[2]} ${match[3]} ${match[4]}`;
  }
  return phone;
};

/**
 * Get order status badge color
 */
export const getOrderStatusColor = (status) => {
  const colors = {
    BEKLEMEDE: 'warning',
    ONAYLANDI: 'info',
    HAZIRLANIYOR: 'info',
    YOLDA: 'info',
    TESLIM_EDILDI: 'success',
    IPTAL_EDILDI: 'danger',
    REDDEDILDI: 'danger',
  };
  return colors[status] || 'info';
};

/**
 * Get approval status badge color
 */
export const getApprovalStatusColor = (status) => {
  const colors = {
    BEKLEMEDE: 'warning',
    ONAYLANDI: 'success',
    REDDEDILDI: 'danger',
  };
  return colors[status] || 'info';
};

/**
 * Download file
 */
export const downloadFile = (url, filename) => {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Copy to clipboard
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
};

/**
 * Debounce function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Get file extension
 */
export const getFileExtension = (filename) => {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
};

/**
 * Check if file type is allowed
 */
export const isAllowedFileType = (file, allowedTypes) => {
  return allowedTypes.includes(file.type);
};

/**
 * Format file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Generate random ID
 */
export const generateId = () => {
  return Math.random().toString(36).substring(2, 9);
};

/**
 * Sleep/delay function
 */
export const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export default {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatRelativeTime,
  formatRelativeDate,
  truncateText,
  capitalizeFirst,
  getInitials,
  isValidEmail,
  isValidPhone,
  isValidTCKN,
  formatPhoneNumber,
  getOrderStatusColor,
  getApprovalStatusColor,
  downloadFile,
  copyToClipboard,
  debounce,
  getFileExtension,
  isAllowedFileType,
  formatFileSize,
  generateId,
  sleep,
};
