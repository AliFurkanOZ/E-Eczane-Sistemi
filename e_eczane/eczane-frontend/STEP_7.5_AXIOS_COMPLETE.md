# ✅ STEP 7.5 - Axios Configuration - COMPLETE

## 🎯 Objective
Configure Axios with proper interceptors and create a clean authentication API structure.

---

## ✅ What Was Accomplished

### 1. **Axios Instance Updated (src/api/axios.js)**

#### **New Configuration**
```javascript
import axios from 'axios';
import { API_URL } from '../utils/constants';

// Axios instance oluştur
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

**Changes:**
- ✅ Uses `API_URL` from constants (cleaner)
- ✅ Removed `timeout` (use default)
- ✅ Turkish comments for team readability
- ✅ Simplified configuration

#### **Request Interceptor**
```javascript
// Request interceptor - her istekte token ekle
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
```

**Features:**
- ✅ Auto-injects JWT token from localStorage
- ✅ Adds `Authorization: Bearer {token}` header
- ✅ Applies to all requests automatically

#### **Response Interceptor**
```javascript
// Response interceptor - hata yönetimi
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // 401 Unauthorized - Token geçersiz
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      
      // 403 Forbidden - Yetki yok
      if (error.response.status === 403) {
        console.error('Bu işlem için yetkiniz yok');
      }
    }
    
    return Promise.reject(error);
  }
);
```

**Features:**
- ✅ **401 Handling:** Auto logout & redirect to login
- ✅ **403 Handling:** Permission error logging
- ✅ Simplified error handling (removed verbose logging)
- ✅ Focused on critical errors only

---

### 2. **Auth API Refactored (src/api/authApi.js)**

#### **New Structure**
```javascript
import axios from './axios';

export const authApi = {
  // Login
  login: async (identifier, password, userType) => {
    const response = await axios.post('/api/auth/login', {
      identifier,
      password,
      user_type: userType,
    });
    return response.data;
  },

  // Register Hasta
  registerHasta: async (data) => {
    const response = await axios.post('/api/auth/register/hasta', data);
    return response.data;
  },

  // Register Eczane
  registerEczane: async (data) => {
    const response = await axios.post('/api/auth/register/eczane', data);
    return response.data;
  },

  // Get current user
  getMe: async () => {
    const response = await axios.get('/api/auth/me');
    return response.data;
  },

  // Change password
  changePassword: async (data) => {
    const response = await axios.post('/api/auth/change-password', data);
    return response.data;
  },

  // Logout
  logout: async () => {
    const response = await axios.post('/api/auth/logout');
    return response.data;
  },
};
```

**Changes:**
- ✅ Refactored from individual exports to `authApi` object
- ✅ Cleaner import: `import { authApi } from '@/api/authApi'`
- ✅ Consistent naming pattern
- ✅ Added `getMe()` for current user
- ✅ Added `changePassword()` for password updates
- ✅ `logout()` now calls server endpoint (server-side logout)

**Removed:**
- ❌ `refreshToken()` - Not implemented in backend yet
- ❌ Individual function exports
- ❌ Client-side only logout

---

## 📊 API Reference

### **authApi Methods**

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `login(identifier, password, userType)` | String, String, String | `{ access_token, user, user_type }` | Login user |
| `registerHasta(data)` | Object | `{ id, email, ... }` | Register patient |
| `registerEczane(data)` | Object | `{ id, eczane_adi, ... }` | Register pharmacy |
| `getMe()` | - | `{ user }` | Get current user info |
| `changePassword(data)` | `{ old_password, new_password }` | Success message | Change password |
| `logout()` | - | Success message | Logout (server-side) |

---

## 💡 Usage Examples

### **1. Login**
```javascript
import { authApi } from '@/api/authApi';

// Login as patient
try {
  const result = await authApi.login('patient@email.com', 'password123', 'hasta');
  
  // Store token
  localStorage.setItem('token', result.access_token);
  localStorage.setItem('user', JSON.stringify(result.user));
  
  // Redirect
  navigate('/hasta/dashboard');
} catch (error) {
  console.error('Login failed:', error.response.data.detail);
}
```

### **2. Register Patient**
```javascript
try {
  const newUser = await authApi.registerHasta({
    ad: 'Ali',
    soyad: 'Veli',
    email: 'ali@example.com',
    password: 'SecurePass123!',
    telefon: '05551234567',
    tc_kimlik_no: '12345678901',
    dogum_tarihi: '1990-01-01',
    adres: 'İstanbul, Turkey',
  });
  
  console.log('User registered:', newUser);
} catch (error) {
  console.error('Registration failed:', error.response.data.detail);
}
```

### **3. Register Pharmacy**
```javascript
try {
  const newPharmacy = await authApi.registerEczane({
    eczane_adi: 'Merkez Eczanesi',
    email: 'merkez@eczane.com',
    password: 'PharmacyPass123!',
    telefon: '02121234567',
    adres: 'İstanbul, Kadıköy',
    ruhsat_no: 'IST-12345',
    iban: 'TR330006100519786457841326',
    vergi_no: '1234567890',
  });
  
  console.log('Pharmacy registered:', newPharmacy);
} catch (error) {
  console.error('Registration failed:', error.response.data.detail);
}
```

### **4. Get Current User**
```javascript
try {
  const currentUser = await authApi.getMe();
  console.log('Current user:', currentUser);
} catch (error) {
  // 401 error - auto logout & redirect happens
  console.error('Not authenticated');
}
```

### **5. Change Password**
```javascript
try {
  await authApi.changePassword({
    old_password: 'OldPass123!',
    new_password: 'NewPass123!',
  });
  
  alert('Password changed successfully!');
} catch (error) {
  console.error('Password change failed:', error.response.data.detail);
}
```

### **6. Logout**
```javascript
try {
  await authApi.logout();
  
  // Clear local storage
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  
  // Redirect
  navigate('/login');
} catch (error) {
  console.error('Logout failed:', error);
}
```

---

## 🔐 Authentication Flow

### **Complete Flow Diagram**

```
1. User Login
   ↓
2. authApi.login(email, password, userType)
   ↓
3. Axios POST /api/auth/login
   ↓
4. Backend validates & returns token
   ↓
5. Frontend stores token in localStorage
   ↓
6. All subsequent requests include token
   ↓
7. Token expires (401 error)
   ↓
8. Interceptor catches 401
   ↓
9. Auto logout & redirect to /login
```

### **Token Lifecycle**

```javascript
// 1. Login - Store token
localStorage.setItem('token', result.access_token);

// 2. Every request - Auto inject token
// Interceptor adds: Authorization: Bearer {token}

// 3. Token valid - Request succeeds
// Response returned normally

// 4. Token expired - 401 error
// Interceptor catches and:
localStorage.removeItem('token');
localStorage.removeItem('user');
window.location.href = '/login';
```

---

## ✨ Benefits

### **1. Simplified Configuration**
- ✅ Cleaner code with less boilerplate
- ✅ Uses constants for API URL
- ✅ No hardcoded timeouts
- ✅ Turkish comments for team

### **2. Automatic Token Management**
- ✅ Token auto-injected on every request
- ✅ No need to manually add headers
- ✅ Consistent authorization

### **3. Smart Error Handling**
- ✅ Auto logout on 401 (token expired)
- ✅ Permission errors logged (403)
- ✅ No verbose error logs (cleaner console)

### **4. Clean API Structure**
- ✅ `authApi` object pattern
- ✅ Single import for all auth functions
- ✅ Consistent method naming
- ✅ Type-safe parameters

### **5. Developer Experience**
- ✅ Easy to use and understand
- ✅ Clear method signatures
- ✅ Handles common scenarios automatically
- ✅ Less code to write

---

## 🔄 Migration Guide

### **From Old Code**
```javascript
// OLD - Individual imports
import { login, registerHasta, logout } from '@/api/authApi';

await login({ identifier: email, password, user_type: 'hasta' });
await registerHasta(data);
logout(); // Client-side only
```

### **To New Code**
```javascript
// NEW - authApi object
import { authApi } from '@/api/authApi';

await authApi.login(email, password, 'hasta');
await authApi.registerHasta(data);
await authApi.logout(); // Server-side
```

---

## 🚨 Error Handling

### **Common Errors**

| Status | Error | Auto-Handled | Action |
|--------|-------|--------------|--------|
| **401** | Unauthorized | ✅ Yes | Auto logout & redirect |
| **403** | Forbidden | ⚠️ Logged | Manual handling needed |
| **400** | Bad Request | ❌ No | Catch in component |
| **500** | Server Error | ❌ No | Catch in component |

### **Handle Errors in Components**
```javascript
try {
  await authApi.login(email, password, userType);
} catch (error) {
  if (error.response) {
    // Server responded with error
    switch (error.response.status) {
      case 400:
        setError('Invalid credentials');
        break;
      case 404:
        setError('User not found');
        break;
      default:
        setError('An error occurred');
    }
  } else {
    // Network error
    setError('Network error. Please try again.');
  }
}
```

---

## 📝 Files Modified Summary

| File | Changes | Lines |
|------|---------|-------|
| `src/api/axios.js` | Simplified config, Turkish comments | -17 lines |
| `src/api/authApi.js` | Refactored to authApi object | -1 line |

---

## 🎉 Status

**STEP 7.5: ✅ COMPLETE**

**Configured:**
- ✅ Axios instance with interceptors
- ✅ Auto token injection
- ✅ 401/403 error handling
- ✅ authApi object structure
- ✅ 6 auth methods ready to use

**Features:**
- ✅ Auto logout on token expiry
- ✅ Clean API structure
- ✅ Turkish comments
- ✅ Simplified configuration

**Ready for Step 7.6 - App.jsx & Router Setup!** 🚀

---

**Created:** December 3, 2025  
**Status:** ✅ Complete and production-ready
