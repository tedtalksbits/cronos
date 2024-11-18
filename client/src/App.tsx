import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Login } from './app/routes/auth';
import { Dashboard } from './app/routes/dashboard';
import { NotFound } from './app/components/not-found';
import { AuthProvider } from './providers/AuthProvider';
import { Logs } from './app/routes/logs';
import { LandingRoute } from './app/routes/landing';
import { RouteProtector } from './lib/auth/routeProtector';
import { Scripts } from './app/routes/scripts';
import DashboardLayout from './app/components/layouts/dashboard-layout';
import { UserManagement } from './app/routes/users';
import { EmailVerification } from './app/routes/email-verification';
import { Webhooks } from './app/routes/webhooks';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path='/' element={<LandingRoute redirectTo='/dashboard' />} />
          <Route path='/login' element={<Login />} />
          <Route path='/email-verification' element={<EmailVerification />} />
          {/* <Route path='/register' element={<Register />} /> */}
          <Route element={<DashboardLayout />}>
            <Route
              path='/dashboard'
              element={
                <RouteProtector>
                  <Dashboard />
                </RouteProtector>
              }
            />
            <Route
              path='/:id/logs'
              element={
                <RouteProtector>
                  <Logs />
                </RouteProtector>
              }
            />
            <Route
              path='/scripts'
              element={
                <RouteProtector>
                  <Scripts />
                </RouteProtector>
              }
            />
            <Route
              path='/users'
              element={
                <RouteProtector>
                  <UserManagement />
                </RouteProtector>
              }
            />
            <Route
              path='/:id/webhooks'
              element={
                <RouteProtector>
                  <Webhooks />
                </RouteProtector>
              }
            />
          </Route>
          <Route path='*' element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
