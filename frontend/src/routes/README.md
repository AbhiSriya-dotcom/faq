# Routes

Centralized route definitions and route protection for Rogare.

## Files

```
routes/
├── index.jsx          # Route config and named exports
├── ProtectedRoute.jsx # Auth guard component
└── README.md
```

## Route Table

| Path | Component | Guard | Description |
|------|-----------|-------|-------------|
| `/` | `Landing` | None | Public landing/home page |
| `/user` | `UserHome` | Authenticated (any role) | Authenticated user dashboard |
| `/admin` | `AdminHome` | `ADMIN` role only | Admin dashboard |

## ProtectedRoute

Wraps authenticated routes. Accepts `requiredRole` prop for role-based access control.

```jsx
<ProtectedRoute requiredRole="ADMIN">
  <AdminHome />
</ProtectedRoute>
```

### Behaviour

| Condition | Action |
|-----------|--------|
| No user in auth store | Redirect to `/` |
| User role doesn't match `requiredRole` | Redirect to `user.role === 'ADMIN' ? '/admin' : '/user'` |
| Authenticated + correct role | Render children |

Uses Zustand (`useAuthStore`) for auth state. Requires `user` object with a `role` field in the store.

## Usage

Import the `routes` array to pass into your router:

```jsx
import { routes } from './routes'

<Routes>
  {routes.map((route) => (
    <Route key={route.path} path={route.path} element={route.element} />
  ))}
</Routes>
```
