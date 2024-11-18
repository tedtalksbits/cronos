export type User = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  secret?: string;
  avatar?: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  lastLogin?: Date;
  lastFailedLogin?: Date;
  failedLoginAttempts: number;
  status?: 'Active' | 'Inactive' | 'Pending' | 'Locked';
  role?: 'User' | 'Admin';
};
import { createContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export type LoginCredentials = {
  email: string;
  password: string;
  token: string;
};

export type RegisterCredentials = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
};

export type LoginResponse = ServerResponseData<{
  token: string;
  qrCode?: string;
}>;

export type RegisterResponse = ServerResponseData<{
  qrCode: string;
}>;

export type LogoutResponse = ServerResponseData<undefined>;

type AuthContextType = {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  loading: boolean;
  login: (
    credentials: LoginCredentials,
    callback: (res: LoginResponse) => void
  ) => Promise<void>;
  register: (
    credentials: RegisterCredentials,
    callback: (res: RegisterResponse) => void
  ) => Promise<void>;
  logout: (callback: (res: LogoutResponse) => void) => Promise<void>;
  isAuthenticated: boolean;
  qrCode: string | null;
  requestOTP: (
    email: string,
    callback: (res: ServerResponseData<undefined>) => void
  ) => Promise<void>;
  sendVerificationEmail: (
    email: string,
    callback: (res: ServerResponseData<undefined>) => void
  ) => Promise<void>;
};

export type ServerResponseData<T> = {
  data: T;
  links: {
    self: string;
  };
  message: string;
  status: number;
};

export const AuthContext = createContext({} as AuthContextType);

type AuthProviderProps = {
  children: React.ReactNode;
};

const { VITE_APP_API_URL } = import.meta.env;

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const navigate = useNavigate();

  // Check if user is already logged in from previous session
  useEffect(() => {
    const storedToken = getLocalAuthToken;
    const storedUser = getLocalUser();
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(storedUser);
    }
  }, []);

  const login = async (
    credentials: LoginCredentials,
    callback: (
      res: ServerResponseData<{
        token: string;
        qrCode?: string;
      }>
    ) => void
  ) => {
    console.log(credentials);
    setLoading(true);
    const response = await fetch(`${VITE_APP_API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    const data = (await response.json()) as ServerResponseData<{
      token: string;
      qrCode?: string;
      user?: User;
    }>;
    console.log(data);
    setLoading(false);
    if (data.status === 200) {
      setToken(data.data.token);
      setUser(data.data.user as User);
      setQrCode(data.data.qrCode || null);

      storeLocalAuthToken(data.data.token);
      storeLocalUser(data.data.user as User);

      navigate('/');
    }
    callback(data);
  };

  const requestOTP = async (
    email: string,
    callback: (res: ServerResponseData<undefined>) => void
  ) => {
    const response = await fetch(`${VITE_APP_API_URL}/auth/otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
      }),
    });

    const data = (await response.json()) as ServerResponseData<undefined>;
    console.log(data);
    callback(data);
  };

  const register = async (
    credentials: RegisterCredentials,
    callback: (
      res: ServerResponseData<{
        qrCode: string;
      }>
    ) => void
  ) => {
    setLoading(true);
    const response = await fetch(`${VITE_APP_API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data = (await response.json()) as ServerResponseData<{
      qrCode: string;
    }>;
    console.log(data);
    setLoading(false);
    callback(data);
  };

  const logout = async (callback: (res: LogoutResponse) => void) => {
    console.log('logOut');
    setUser(null);
    clearLocalAuthToken();
    clearLocalUser();
    setLoading(true);
    const response = await fetch(`${VITE_APP_API_URL}/auth/logout`);
    const data = (await response.json()) as LogoutResponse;
    console.log(data);
    setLoading(false);
    callback(data);
  };

  const sendVerificationEmail = async (
    email: string,
    callback: (res: ServerResponseData<undefined>) => void
  ) => {
    const storedToken = getLocalAuthToken();
    const response = await fetch(`${VITE_APP_API_URL}/auth/verify-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${storedToken}`,
      },
      body: JSON.stringify({
        email,
      }),
    });

    const data = (await response.json()) as ServerResponseData<undefined>;
    console.log(data);
    callback(data);
  };

  // get last session
  useEffect(() => {
    console.log('app loaded, get user last session');
    const storedToken = getLocalAuthToken();
    fetch(`${VITE_APP_API_URL}/auth/whoami`, {
      headers: {
        Authorization: `Bearer ${storedToken}`,
      },
    })
      .then((res) => res.json())
      .then((response: ServerResponseData<User>) => {
        setUser(response.data);
        setToken(storedToken);
        console.log('User last session:', response.data);
        console.log('Token:', storedToken);
        setLoading(false);
      })
      .catch(() =>
        logout((res) => {
          if (res) {
            console.log('Logged out');
            navigate('/login');
          }
        })
      );
  }, []);

  const isAuthenticated = Boolean(user && token);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        login,
        logout,
        register,
        isAuthenticated,
        qrCode,
        requestOTP,
        sendVerificationEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function storeLocalAuthToken(token: string) {
  localStorage.setItem('token', token);
}

export function getLocalAuthToken() {
  return localStorage.getItem('token');
}

export function clearLocalAuthToken() {
  localStorage.removeItem('token');
}

export function storeLocalUser(user: User) {
  localStorage.setItem('user', JSON.stringify(user));
}

export function getLocalUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

export function clearLocalUser() {
  localStorage.removeItem('user');
}
