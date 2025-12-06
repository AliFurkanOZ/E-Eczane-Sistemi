# Patient (Hasta) Functionality Guide

This guide explains how to test and use all the patient functionalities in the E-Eczane system.

## Overview

The patient dashboard has been enhanced with the following key features:
1. Dashboard Overview
2. Profile Management
3. Prescription Viewing
4. Order History
5. Shopping Cart
6. Medicine Search

## How to Test Each Feature

### 1. Dashboard Overview

**Access:** Automatically shown after patient login

**Features:**
- Summary cards showing active prescriptions, orders, and cart items
- Quick navigation to all sections
- Recent order history

**Testing Steps:**
1. Log in as a patient
2. Verify dashboard loads correctly
3. Check that summary cards display correct counts
4. Click on each card to navigate to respective sections

### 2. Profile Management

**Access:** Click "Profilim" in sidebar or from dashboard

**Features:**
- View personal information
- Update name, surname, address, phone number
- Email updates (if allowed by system)
- TC number displayed as read-only

**Testing Steps:**
1. Navigate to Profile page
2. Verify all personal information is displayed correctly
3. Try updating one field (e.g., phone number)
4. Save changes and verify success message
5. Refresh page and confirm changes persisted

### 3. Prescription Viewing

**Access:** Click "Reçetelerim" in sidebar or from dashboard

**Features:**
- List all prescriptions assigned to the patient
- View prescription details including:
  - Prescription number
  - Date
  - Doctor name
  - Hospital
  - Medication list with usage instructions
  - Total amount

**Testing Steps:**
1. Navigate to Prescriptions page
2. Verify all prescriptions are listed
3. Check that prescription details are complete
4. Confirm medication lists show correct information

### 4. Order History

**Access:** Click "Sipariş Geçmişim" in sidebar or from dashboard

**Features:**
- List all past orders
- View order status (pending, approved, preparing, shipping, delivered, cancelled)
- See order details including:
  - Order number
  - Date and time
  - Pharmacy name
  - Itemized list of medications
  - Total amount

**Testing Steps:**
1. Navigate to Order History page
2. Verify all orders are listed
3. Check different order statuses are displayed correctly
4. Confirm order details are accurate

### 5. Shopping Cart

**Access:** Click "Sepetim" in sidebar or from dashboard

**Features:**
- View items added to cart
- Adjust quantities
- Remove items
- See total amount
- Proceed to checkout

**Testing Steps:**
1. Navigate to Cart page
2. Add items to cart from Medicine Search (if available)
3. Adjust quantities of items
4. Remove an item and verify it's removed
5. Check that total amount calculates correctly
6. Try "Proceed to Checkout" button

### 6. Medicine Search

**Access:** Click "İlaç Ara" in sidebar or from dashboard

**Features:**
- Search medicines by name or barcode
- View search results with:
  - Medicine name
  - Barcode
  - Price
  - Stock status
- Add medicines to cart
- Browse popular medicines

**Testing Steps:**
1. Navigate to Medicine Search page
2. Search for a medicine by name (e.g., "Parol")
3. Search for a medicine by barcode
4. Verify search results display correctly
5. Try adding an in-stock item to cart
6. Try adding an out-of-stock item (should be disabled)

## Navigation

All patient sections can be accessed through:
1. **Sidebar Navigation:** Available on all pages
2. **Dashboard Cards:** Clickable summary cards on the main dashboard
3. **Direct URLs:**
   - Dashboard: `/hasta/dashboard`
   - Profile: `/hasta/profil`
   - Prescriptions: `/hasta/receteler`
   - Orders: `/hasta/siparisler`
   - Cart: `/hasta/sepet`
   - Medicine Search: `/hasta/ilaclar`

## Error Handling

The system includes proper error handling:
- Loading indicators during data fetch
- Error messages for failed operations
- Success messages for completed actions
- Empty state views for sections with no data

## Responsive Design

All pages are designed to work on:
- Desktop browsers
- Tablet devices
- Mobile phones

Test by resizing browser window or using developer tools to simulate different screen sizes.

## Troubleshooting

**Common Issues:**

1. **Page not loading:**
   - Check that backend server is running
   - Verify API endpoints are accessible
   - Check browser console for errors

2. **Data not displaying:**
   - Ensure patient has data in the system
   - Check database connections
   - Verify API responses in browser dev tools

3. **Actions not working:**
   - Check browser console for JavaScript errors
   - Verify form validation requirements
   - Confirm network requests are successful

**Debugging Tips:**

1. Open browser developer tools (F12)
2. Check Console tab for errors
3. Check Network tab for failed API requests
4. Verify localStorage for authentication tokens
5. Check Redux state in React DevTools if available

## User Experience Notes

1. **Performance:** All pages include loading states for better user experience
2. **Accessibility:** Proper contrast ratios and semantic HTML
3. **Feedback:** Visual feedback for all user actions
4. **Consistency:** Uniform design language across all pages
5. **Navigation:** Clear breadcrumbs and back buttons

## Testing Checklist

Before considering the patient functionality complete, verify:

- [ ] Dashboard loads with correct summary information
- [ ] Profile page displays and updates information correctly
- [ ] Prescriptions page shows all patient prescriptions
- [ ] Order history page displays past orders accurately
- [ ] Cart page manages items properly
- [ ] Medicine search returns correct results
- [ ] All navigation paths work correctly
- [ ] Error states are handled gracefully
- [ ] Loading states provide user feedback
- [ ] Mobile responsiveness works correctly
- [ ] All buttons and links function as expected

## Support

If you encounter any issues with the patient functionality:
1. Check the browser console for error messages
2. Verify backend services are running
3. Confirm database connections are active
4. Contact the development team with detailed error information