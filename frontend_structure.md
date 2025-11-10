# Frontend Application Structure (React 19 + Vite)

## Project Structure

```
library-management-system/
├── frontend/
│   ├── public/
│   │   ├── favicon.ico
│   │   └── assets/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Input.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   ├── Loading.jsx
│   │   │   │   ├── Notification.jsx
│   │   │   │   └── Card.jsx
│   │   │   ├── layout/
│   │   │   │   ├── Header.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   ├── Footer.jsx
│   │   │   │   └── Layout.jsx
│   │   │   ├── auth/
│   │   │   │   ├── LoginForm.jsx
│   │   │   │   ├── RegisterForm.jsx
│   │   │   │   └── AuthGuard.jsx
│   │   │   ├── dashboard/
│   │   │   │   ├── AdminDashboard.jsx
│   │   │   │   ├── UserDashboard.jsx
│   │   │   │   ├── StatsCard.jsx
│   │   │   │   └── ActivityFeed.jsx
│   │   │   ├── books/
│   │   │   │   ├── BookList.jsx
│   │   │   │   ├── BookCard.jsx
│   │   │   │   ├── BookDetails.jsx
│   │   │   │   ├── BookForm.jsx
│   │   │   │   ├── SearchBar.jsx
│   │   │   │   ├── RatingStars.jsx
│   │   │   │   └── RatingForm.jsx
│   │   │   ├── users/
│   │   │   │   ├── UserList.jsx
│   │   │   │   ├── UserCard.jsx
│   │   │   │   ├── UserForm.jsx
│   │   │   │   └── UserProfile.jsx
│   │   │   ├── borrowing/
│   │   │   │   ├── BorrowingHistory.jsx
│   │   │   │   ├── BorrowButton.jsx
│   │   │   │   ├── ReturnButton.jsx
│   │   │   │   └── DueDateBadge.jsx
│   │   │   └── notifications/
│   │   │       ├── NotificationList.jsx
│   │   │       └── NotificationItem.jsx
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   ├── useBooks.js
│   │   │   ├── useUsers.js
│   │   │   ├── useBorrowing.js
│   │   │   └── useNotifications.js
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   ├── bookService.js
│   │   │   ├── userService.js
│   │   │   └── notificationService.js
│   │   ├── utils/
│   │   │   ├── constants.js
│   │   │   ├── helpers.js
│   │   │   ├── validators.js
│   │   │   └── formatters.js
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Books.jsx
│   │   │   ├── BookDetails.jsx
│   │   │   ├── Users.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Resources.jsx
│   │   │   └── NotFound.jsx
│   │   ├── styles/
│   │   │   ├── index.css
│   │   │   ├── components.css
│   │   │   └── themes.css
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── package.json
│   └── README.md
├── backend/
│   └── [Laravel project structure]
├── docker-compose.yml
├── .env.example
└── README.md
```

## Component Architecture

### Atomic Design Pattern
- **Atoms**: Basic UI elements (Button, Input, Icon)
- **Molecules**: Combinations of atoms (SearchBar, RatingStars, Card)
- **Organisms**: Complex components (BookList, UserForm, Dashboard)
- **Templates**: Page layouts (Dashboard, BookDetails)
- **Pages**: Complete pages with data (Books page, User profile)

### State Management Strategy

#### Authentication State (React Context)
```jsx
const AuthContext = createContext();

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Auth methods: login, logout, register
}
```

#### Server State (React Query)
```jsx
// Books data with caching
const useBooks = (filters) => {
  return useQuery(['books', filters], () => fetchBooks(filters), {
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Mutations for CRUD operations
const useCreateBook = () => {
  const queryClient = useQueryClient();
  return useMutation(createBook, {
    onSuccess: () => {
      queryClient.invalidateQueries('books');
    },
  });
};
```

## Routing Structure

### Public Routes
- `/login` - User/Admin login
- `/register` - User registration (Admin only access)

### Protected Routes
- `/dashboard` - Main dashboard (role-specific content)
- `/books` - Book listing and search
- `/books/:id` - Book details with borrow/rate options
- `/users` - User management (Admin only)
- `/users/:id` - User profile/details
- `/profile` - Current user profile
- `/resources` - Learning resources page

### Route Guards
```jsx
// AuthGuard for authentication
function AuthGuard({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <Loading />;
  if (!user) return <Navigate to="/login" />;

  return children;
}

// AdminGuard for role-based access
function AdminGuard({ children }) {
  const { user } = useAuth();

  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" />;
  }

  return children;
}
```

## Styling Strategy (Tailwind CSS)

### Design System
- **Colors**: Professional fintech palette
  - Primary: Blue (#1e40af) for actions
  - Success: Green (#10b981) for confirmations
  - Warning: Yellow (#f59e0b) for warnings
  - Error: Red (#ef4444) for errors
  - Neutral: Gray scale for text and backgrounds

- **Typography**: Clean hierarchy
  - Headings: Inter font family
  - Body: System font stack
  - Sizes: 14px base, 16px large, 18px+ for headings

- **Spacing**: Consistent scale (4px base unit)
  - 1: 4px, 2: 8px, 3: 12px, 4: 16px, 6: 24px, 8: 32px, etc.

### Component Classes
```jsx
// Button variants
const buttonVariants = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white',
  secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
  danger: 'bg-red-600 hover:bg-red-700 text-white',
};

// Card component
function Card({ children, className = '' }) {
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      {children}
    </div>
  );
}
```

## Fintech-Inspired UI Elements

### Dashboard Metrics
- KPI cards with trend indicators
- Progress bars for borrowing limits
- Status badges for book availability
- Timeline components for activity feeds

### Data Visualization
- Simple charts for borrowing statistics
- Rating distributions
- Due date calendars
- User activity heatmaps

### Interactive Elements
- Smooth transitions and micro-animations
- Loading states with skeleton screens
- Toast notifications for actions
- Confirmation modals for destructive actions

### Accessibility Features
- Semantic HTML structure
- ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support

## Performance Optimizations

### Code Splitting
```jsx
// Lazy load pages
const Books = lazy(() => import('./pages/Books'));
const BookDetails = lazy(() => import('./pages/BookDetails'));

// With React Router
<Route
  path="/books"
  element={
    <Suspense fallback={<Loading />}>
      <Books />
    </Suspense>
  }
/>
```

### Image Optimization
- Lazy loading for book covers
- WebP format with fallbacks
- Responsive images with srcset

### Bundle Analysis
- Vite build analyzer
- Tree shaking for unused code
- Dynamic imports for large components

## Testing Strategy

### Unit Tests (Vitest)
- Component rendering tests
- Hook logic tests
- Utility function tests
- API service mocks

### Integration Tests (React Testing Library)
- User interaction flows
- Form submissions
- Navigation scenarios
- Error state handling

### E2E Tests (Playwright - optional)
- Critical user journeys
- Cross-browser compatibility
- Performance monitoring

## Development Workflow

### Local Development
- Vite dev server with HMR
- ESLint for code quality
- Prettier for code formatting
- Husky for pre-commit hooks

### Build Process
- TypeScript checking (if used)
- Asset optimization
- Bundle analysis
- Deployment preparation

This structure provides a scalable, maintainable frontend architecture that aligns with fintech design principles and modern React best practices.