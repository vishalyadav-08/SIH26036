# Web App Execution Plan

This document contains the exact, copy-pasteable code for the React Web App, structured step-by-step.

## 1. Tailwind Configuration & Global Styles

**`tailwind.config.js`**
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        }
      }
    },
  },
  plugins: [],
}
```

**`src/index.css`**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-gray-50 text-gray-900 font-sans;
  }
}
```

## 2. API Configuration

**`src/lib/api.ts`**
```typescript
import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);
```

## 3. Global State (Zustand)

**`src/store/useAuthStore.ts`**
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  role: 'admin' | 'business' | 'officer';
  name: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
```

## 4. App Routing

**`src/App.tsx`**
```typescript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './store/useAuthStore';
import DashboardLayout from './components/layout/DashboardLayout';
import LoginPage from './features/auth/LoginPage';
import Dashboard from './features/business/Dashboard';
import InstrumentForm from './features/business/InstrumentForm';
import PassportTimeline from './features/business/PassportTimeline';
import VerifyPage from './features/public/VerifyPage';

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = useAuthStore((state) => state.token);
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/verify/:passportId" element={<VerifyPage />} />
          <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="instruments/new" element={<InstrumentForm />} />
            <Route path="instruments/:id/timeline" element={<PassportTimeline />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
```

## 5. UI Components

**`src/components/ui/Button.tsx`**
```typescript
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', children, ...props }, ref) => {
    const baseStyles = 'px-4 py-2 rounded font-medium focus:outline-none transition-colors';
    const variants = {
      primary: 'bg-primary-600 text-white hover:bg-primary-700',
      secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
      outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50',
    };
    return (
      <button ref={ref} className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
```

**`src/components/ui/Input.tsx`**
```typescript
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1 w-full">
        {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
        <input
          ref={ref}
          className={`border rounded px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:outline-none ${
            error ? 'border-red-500' : 'border-gray-300'
          } ${className}`}
          {...props}
        />
        {error && <span className="text-xs text-red-500">{error}</span>}
      </div>
    );
  }
);
Input.displayName = 'Input';
```

**`src/components/ui/Card.tsx`**
```typescript
export const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white shadow rounded-lg p-6 ${className}`}>{children}</div>
);
```

**`src/components/ui/StatusBadge.tsx`**
```typescript
export const StatusBadge = ({ status }: { status: string }) => {
  const colors: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    expired: 'bg-red-100 text-red-800',
  };
  const colorClass = colors[status.toLowerCase()] || 'bg-gray-100 text-gray-800';
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colorClass}`}>
      {status.toUpperCase()}
    </span>
  );
};
```

**`src/components/ui/Table.tsx`**
```typescript
import React from 'react';

export const Table = ({ headers, children }: { headers: string[], children: React.ReactNode }) => (
  <div className="overflow-x-auto w-full">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          {headers.map((h, i) => (
            <th key={i} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {children}
      </tbody>
    </table>
  </div>
);
```

## 6. Layout Components

**`src/components/layout/Sidebar.tsx`**
```typescript
import { Link } from 'react-router-dom';

export const Sidebar = () => (
  <aside className="w-64 bg-gray-800 text-white min-h-screen flex flex-col">
    <div className="p-4 text-xl font-bold border-b border-gray-700">Mapansetu</div>
    <nav className="flex-1 p-4 space-y-2">
      <Link to="/" className="block px-4 py-2 rounded hover:bg-gray-700">Dashboard</Link>
      <Link to="/instruments/new" className="block px-4 py-2 rounded hover:bg-gray-700">Register Instrument</Link>
    </nav>
  </aside>
);
```

**`src/components/layout/Header.tsx`**
```typescript
import { useAuthStore } from '../../store/useAuthStore';
import { Button } from '../ui/Button';

export const Header = () => {
  const { user, logout } = useAuthStore();
  return (
    <header className="bg-white shadow h-16 flex items-center justify-between px-6">
      <h2 className="text-lg font-semibold text-gray-800">Welcome, {user?.name || 'User'}</h2>
      <Button variant="outline" onClick={logout}>Logout</Button>
    </header>
  );
};
```

**`src/components/layout/DashboardLayout.tsx`**
```typescript
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

const DashboardLayout = () => (
  <div className="flex h-screen overflow-hidden bg-gray-50">
    <Sidebar />
    <div className="flex flex-col flex-1 overflow-hidden">
      <Header />
      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  </div>
);

export default DashboardLayout;
```

## 7. Authentication

**`src/features/auth/LoginPage.tsx`**
```typescript
import { useForm } from 'react-form-hook';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { useAuthStore } from '../../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type FormData = z.infer<typeof schema>;

const LoginPage = () => {
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: (data: FormData) => api.post('/auth/login', data).then(res => res.data),
    onSuccess: (data) => {
      setAuth(data.token, data.user);
      navigate('/');
    }
  });

  const onSubmit = (data: FormData) => mutation.mutate(data);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Email" type="email" {...register('email')} error={errors.email?.message} />
          <Input label="Password" type="password" {...register('password')} error={errors.password?.message} />
          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? 'Logging in...' : 'Login'}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default LoginPage;
```

## 8. Dashboard

**`src/features/business/Dashboard.tsx`**
```typescript
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Link } from 'react-router-dom';

const fetchStats = () => api.get('/stats').then(res => res.data);
const fetchInstruments = () => api.get('/instruments').then(res => res.data);

const Dashboard = () => {
  const statsQuery = useQuery({ queryKey: ['stats'], queryFn: fetchStats });
  const instrumentsQuery = useQuery({ queryKey: ['instruments'], queryFn: fetchInstruments });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <h3 className="text-gray-500 text-sm">Total Instruments</h3>
          <p className="text-3xl font-bold">{statsQuery.data?.total || 0}</p>
        </Card>
        <Card>
          <h3 className="text-gray-500 text-sm">Active Passports</h3>
          <p className="text-3xl font-bold">{statsQuery.data?.active || 0}</p>
        </Card>
        <Card>
          <h3 className="text-gray-500 text-sm">Pending Verification</h3>
          <p className="text-3xl font-bold">{statsQuery.data?.pending || 0}</p>
        </Card>
      </div>

      <Card>
        <h2 className="text-xl font-bold mb-4">Recent Instruments</h2>
        <Table headers={['ID', 'Name', 'Type', 'Status', 'Actions']}>
          {instrumentsQuery.data?.map((inst: any) => (
            <tr key={inst.id}>
              <td className="px-6 py-4 text-sm text-gray-900">{inst.id}</td>
              <td className="px-6 py-4 text-sm text-gray-900">{inst.name}</td>
              <td className="px-6 py-4 text-sm text-gray-900">{inst.type}</td>
              <td className="px-6 py-4 text-sm"><StatusBadge status={inst.status} /></td>
              <td className="px-6 py-4 text-sm">
                <Link to={`/instruments/${inst.id}/timeline`} className="text-primary-600 hover:underline">View Timeline</Link>
              </td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
};

export default Dashboard;
```

## 9. Instrument Registration

**`src/features/business/InstrumentForm.tsx`**
```typescript
import { useForm } from 'react-form-hook';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { useNavigate } from 'react-router-dom';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

const schema = z.object({
  name: z.string().min(2),
  type: z.string().min(2),
  serialNumber: z.string().min(1),
});

type FormData = z.infer<typeof schema>;

const InstrumentForm = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: (data: FormData) => api.post('/instruments', data).then(res => res.data),
    onSuccess: () => navigate('/'),
  });

  return (
    <Card className="max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-6">Register New Instrument</h2>
      <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
        <Input label="Instrument Name" {...register('name')} error={errors.name?.message} />
        <Input label="Type/Category" {...register('type')} error={errors.type?.message} />
        <Input label="Serial Number" {...register('serialNumber')} error={errors.serialNumber?.message} />
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Saving...' : 'Register Instrument'}
        </Button>
      </form>
    </Card>
  );
};

export default InstrumentForm;
```

## 10. Digital Passport Timeline

**`src/features/business/PassportTimeline.tsx`**
```typescript
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';

const PassportTimeline = () => {
  const { id } = useParams<{ id: string }>();
  const { data: timeline, isLoading } = useQuery({
    queryKey: ['timeline', id],
    queryFn: () => api.get(`/instruments/${id}/timeline`).then(res => res.data)
  });

  if (isLoading) return <div>Loading timeline...</div>;

  return (
    <Card className="max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-6">Passport Timeline</h2>
      <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
        {timeline?.map((event: any, index: number) => (
          <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-300 text-slate-500 group-[.is-active]:bg-primary-500 group-[.is-active]:text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
            </div>
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded border border-slate-200 shadow">
              <div className="flex items-center justify-between space-x-2 mb-1">
                <div className="font-bold text-slate-900">{event.title}</div>
                <time className="text-xs font-medium text-primary-500">{new Date(event.date).toLocaleDateString()}</time>
              </div>
              <div className="text-slate-500">{event.description}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default PassportTimeline;
```

## 11. Public Verification Page

**`src/features/public/VerifyPage.tsx`**
```typescript
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/StatusBadge';

const VerifyPage = () => {
  const { passportId } = useParams<{ passportId: string }>();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['verify', passportId],
    queryFn: () => api.get(`/public/verify/${passportId}`).then(res => res.data)
  });

  if (isLoading) return <div className="text-center p-8">Verifying Digital Passport...</div>;
  if (isError) return <div className="text-center p-8 text-red-500">Invalid or Not Found Digital Passport.</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-xl border-t-4 border-t-primary-500">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Digital Passport Verified</h1>
          <p className="text-green-600 font-medium flex items-center justify-center gap-2 mt-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            Authentic Record
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="border-b pb-4">
            <p className="text-sm text-gray-500">Instrument Name</p>
            <p className="font-semibold text-lg">{data.name}</p>
          </div>
          <div className="border-b pb-4">
            <p className="text-sm text-gray-500">Serial Number</p>
            <p className="font-semibold">{data.serialNumber}</p>
          </div>
          <div className="border-b pb-4 flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Current Status</p>
              <StatusBadge status={data.status} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Last Calibrated</p>
              <p className="font-semibold">{new Date(data.lastCalibrated).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-xs text-gray-400 text-center uppercase tracking-wider">Blockchain Hash</p>
            <p className="font-mono text-xs break-all text-center mt-1 text-gray-600">{data.hash}</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default VerifyPage;
```
