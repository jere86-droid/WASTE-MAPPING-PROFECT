# 🧪 WasteMap Testing Checklist

Complete testing guide before deployment.

## ✅ Authentication Tests

### Registration
- [ ] User can register with valid email
- [ ] Password must be 6+ characters
- [ ] Email verification email is sent
- [ ] Cannot register with existing email
- [ ] Form validation works

### Login
- [ ] User can login with correct credentials
- [ ] Error shows for wrong password
- [ ] Error shows for non-existent email
- [ ] Remember me checkbox works
- [ ] Token is stored in localStorage

### Email Verification
- [ ] Verification email is received
- [ ] Verification link works
- [ ] Account is marked as verified
- [ ] Cannot use expired token

### Password Reset
- [ ] Forgot password sends email
- [ ] Reset link works
- [ ] Can set new password
- [ ] Can login with new password

### Profile Management
- [ ] Can view profile
- [ ] Can edit name and email
- [ ] Can change password
- [ ] Can toggle notification preferences
- [ ] Changes persist after logout/login

---

## 🗺️ Map & Report Tests

### Map Display
- [ ] Map loads correctly
- [ ] User location is detected
- [ ] Can pan and zoom
- [ ] All report markers display
- [ ] Markers are color-coded by waste type

### Create Report
- [ ] Can click map to select location
- [ ] Address auto-fills from coordinates
- [ ] Can select waste type
- [ ] Can select urgency level
- [ ] Can add description (max 500 chars)
- [ ] Can upload 1-3 images
- [ ] Cannot upload > 3 images
- [ ] Can remove uploaded images
- [ ] Report appears on map after submission
- [ ] Email notification is sent

### View Reports
- [ ] Can click marker to see popup
- [ ] Popup shows correct information
- [ ] Can filter by waste type
- [ ] Can filter by status
- [ ] Clear filters works
- [ ] Report count updates with filters

### Report Details
- [ ] Can view full report details
- [ ] Images display correctly
- [ ] Image gallery navigation works
- [ ] Can upvote/unvote report
- [ ] Upvote count updates in real-time
- [ ] Location displays on map
- [ ] Admin notes visible if present

### Edit Report
- [ ] Can edit pending reports only
- [ ] Cannot edit in-progress/resolved reports
- [ ] Can update all fields
- [ ] Can change location on map
- [ ] Can add/remove images
- [ ] Changes save correctly

### Delete Report
- [ ] Can delete pending reports only
- [ ] Confirmation dialog appears
- [ ] Report is removed from map
- [ ] Report is removed from My Reports

---

## 📊 My Reports Tests

- [ ] Displays all user's reports
- [ ] Shows correct status badges
- [ ] Shows upvote counts
- [ ] Can view report details
- [ ] Can edit pending reports
- [ ] Can delete pending reports
- [ ] Empty state shows when no reports

---

## 🔔 Notifications Tests

### In-App Notifications
- [ ] Notifications list displays
- [ ] Unread count shows correctly
- [ ] Can mark individual as read
- [ ] Can mark all as read
- [ ] Can delete notifications
- [ ] Real-time updates work

### Email Notifications
- [ ] Status update emails received
- [ ] Announcement emails received
- [ ] Email templates are formatted correctly
- [ ] Links in emails work

### Real-time (Socket.io)
- [ ] Connection indicator shows green when connected
- [ ] Toast appears for new notifications
- [ ] Admins receive new report alerts
- [ ] Reconnects after disconnect

---

## 👑 Admin Tests

### Dashboard
- [ ] Statistics display correctly
- [ ] Charts render properly
- [ ] Recent reports show
- [ ] Quick action cards work

### Manage Reports
- [ ] All reports display in table
- [ ] Can filter by waste type
- [ ] Can filter by status
- [ ] Can update report status
- [ ] Can add admin notes
- [ ] Status update triggers notification
- [ ] Changes reflect immediately

### User Management
- [ ] All users display
- [ ] Stats cards show correct counts
- [ ] Can view user details
- [ ] User's reports display in modal
- [ ] Verified/unverified badges correct

### Export Data
- [ ] CSV export downloads
- [ ] CSV contains all report data
- [ ] File name includes timestamp
- [ ] Data is properly formatted

### Announcements
- [ ] Can send announcement
- [ ] Confirmation dialog appears
- [ ] All users receive email
- [ ] All users get in-app notification
- [ ] Success message shows recipient count

---

## 📱 Responsive Design Tests

### Mobile (< 768px)
- [ ] Navbar collapses to hamburger menu
- [ ] Map sidebar scrolls on mobile
- [ ] Forms are usable
- [ ] Tables scroll horizontally
- [ ] Images resize properly
- [ ] Buttons are tappable

### Tablet (768px - 1024px)
- [ ] Layout adjusts appropriately
- [ ] Grid columns adjust
- [ ] Admin tables display well

### Desktop (> 1024px)
- [ ] Full sidebar visible on map
- [ ] Admin dashboard uses full width
- [ ] All features accessible

---

## 🔒 Security Tests

### Authentication
- [ ] Cannot access protected routes without login
- [ ] Token expires correctly
- [ ] Logout clears token
- [ ] Admin routes require admin role
- [ ] API returns 401 for unauthorized requests

### Authorization
- [ ] Users can only edit their own reports
- [ ] Users can only delete their own reports
- [ ] Non-admins cannot access admin routes
- [ ] API returns 403 for forbidden actions

### Input Validation
- [ ] XSS protection works
- [ ] SQL injection protection works
- [ ] File upload only accepts images
- [ ] File size limits enforced
- [ ] Description length limited

---

## ⚡ Performance Tests

### Load Times
- [ ] Home page loads < 3 seconds
- [ ] Map displays < 2 seconds
- [ ] Image uploads complete < 5 seconds
- [ ] Admin dashboard loads < 3 seconds

### Optimization
- [ ] Images are compressed
- [ ] Lazy loading works
- [ ] API responses are fast
- [ ] No memory leaks

---

## 🌐 Browser Compatibility

### Desktop Browsers
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Mobile Browsers
- [ ] Chrome Mobile
- [ ] Safari Mobile
- [ ] Firefox Mobile

---

## 🐛 Error Handling Tests

### Network Errors
- [ ] Displays error for failed API calls
- [ ] Retry mechanism works
- [ ] Graceful degradation on timeout

### User Errors
- [ ] Form validation errors display
- [ ] Clear error messages
- [ ] Can recover from errors

### Server Errors
- [ ] 404 page displays
- [ ] 500 errors handled gracefully
- [ ] Error boundaries catch React errors

---

## ♿ Accessibility Tests

- [ ] Can navigate with keyboard only
- [ ] Screen reader compatible
- [ ] Proper ARIA labels
- [ ] Sufficient color contrast
- [ ] Focus indicators visible

---

## 📊 Final Checklist Before Deployment

- [ ] All tests passed
- [ ] No console errors
- [ ] Environment variables set
- [ ] MongoDB connection works
- [ ] Cloudinary uploads work
- [ ] Email service works
- [ ] Socket.io connects
- [ ] README is complete
- [ ] .gitignore is set
- [ ] Sensitive data not in code
- [ ] Code is commented
- [ ] Git history is clean

---

## 🎉 Ready for Deployment!

Once all tests pass, proceed with deployment guide in `DEPLOYMENT.md`

---

## 📝 Bug Report Template

```markdown
**Description:**
Brief description of the bug

**Steps to Reproduce:**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior:**
What should happen

**Actual Behavior:**
What actually happens

**Screenshots:**
If applicable

**Environment:**
- Browser:
- OS:
- Device:
```