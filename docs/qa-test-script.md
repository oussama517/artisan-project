# QA Test Script — Artisan Marketplace

## Manual QA Steps — Core Flows

### 1. Authentication Flow
1. Navigate to `/signup`
2. Select "Hire artisans" role
3. Fill in: Name="Test User", Email="test@example.com", Password="TestPass1!"
4. Click "Create Account" → Verify success message appears
5. Navigate to `/signin`
6. Sign in with test credentials → Verify redirect to dashboard
7. Click "Sign Out" → Verify redirect to homepage

### 2. Artisan Registration Flow
1. Navigate to `/signup?role=ARTISAN`
2. Create artisan account
3. After sign-in, navigate to `/artisan/dashboard`
4. Fill in artisan profile (profession, description, skills, service area)
5. Verify profile shows "Approval Pending" status

### 3. Admin Approval Flow
1. Sign in as admin (admin@artisan-marketplace.local / Password1!)
2. Navigate to `/admin`
3. Check "Pending Approvals" section
4. Approve the test artisan
5. Verify notification sent to artisan

### 4. Booking Flow
1. Sign in as customer (sarah@example.com)
2. Navigate to `/artisans`
3. Search for "plumber" → Verify results appear
4. Click on an artisan profile → Verify profile details
5. Click "Book Now"
6. Fill booking form: select service, date, time, address, description
7. Submit → Verify "Pending" status
8. Sign in as the artisan
9. Navigate to artisan bookings → Accept the booking
10. Verify customer receives notification
11. Mark booking as "In Progress" then "Completed"

### 5. Review Flow
1. After completed booking (as customer)
2. Navigate to booking details
3. Click "Write a Review"
4. Select 5 stars, write comment, submit
5. Sign in as admin → Moderate the review
6. Verify review appears on artisan profile

### 6. Messaging Flow
1. As customer, go to an artisan profile
2. Click "Contact Artisan" or navigate to `/dashboard/messages`
3. Send a message
4. Sign in as artisan → Verify message received
5. Reply → Verify customer sees reply

### 7. Responsive Design
1. Open browser DevTools → Toggle device toolbar
2. Test at 375px (mobile), 768px (tablet), 1440px (desktop)
3. Verify: header collapses, grids stack, cards adapt

### 8. Accessibility
1. Navigate using Tab key only → Verify all elements reachable
2. Enable screen reader → Verify landmarks and labels read correctly
3. Zoom to 200% → Verify layout doesn't break

## Load Test Suggestions
```bash
# Using Apache Bench (ab)
ab -n 100 -c 10 http://localhost:3000/api/artisans
ab -n 50 -c 5 http://localhost:3000/api/categories

# Using k6 (recommended)
# k6 run load-test.js
```
