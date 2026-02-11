# StillHungry Frontend

Vite + React frontend for the StillHungry order management system. This UI
supports user ordering flows, live order status simulation, and a full
admin panel for CRUD management. The current demo runs fully on mock JSON data
so you can explore the UI without the backend.

## Features
- Menu browsing with add-on selection
- Cart + checkout with coupon support
- Order status tracking
- Admin dashboard and CRUD screens for users, menu, categories, add-ons, coupons, reviews
- Light and dark mode toggle

## Getting started
```bash
npm install
npm run dev
```

## Demo credentials
- Admin: `admin@stillhungry.com` / `admin123`
- User: `user@stillhungry.com` / `user123`

## Environment
Create a `.env` file at the project root only if you want to wire the API:
```
VITE_API_BASE_URL=http://localhost:5000
```

## Notes
- Admin views require a user with `role=admin`.
- Orders auto-refresh every 15 seconds for status updates.
