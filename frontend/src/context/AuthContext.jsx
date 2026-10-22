import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('eventhub_token') || null);
  const [attendee, setAttendee] = useState(() => {
    const saved = localStorage.getItem('eventhub_attendee');
    return saved ? JSON.parse(saved) : null;
  });
  const [role, setRole] = useState(() => localStorage.getItem('eventhub_role') || null);

  const login = (authData) => {
    // authData contains: { token, attendee: { id, name, email, role } }
    const authToken = authData.token;
    const user = authData.attendee;
    const userRole = user?.role || 'attendee';

    setToken(authToken);
    setAttendee(user);
    setRole(userRole);

    localStorage.setItem('eventhub_token', authToken);
    localStorage.setItem('eventhub_attendee', JSON.stringify(user));
    localStorage.setItem('eventhub_role', userRole);
  };

  const logout = () => {
    setToken(null);
    setAttendee(null);
    setRole(null);

    localStorage.removeItem('eventhub_token');
    localStorage.removeItem('eventhub_attendee');
    localStorage.removeItem('eventhub_role');
  };

  return (
    <AuthContext.Provider
      value={{
        attendee,
        token,
        role,
        isAuthenticated: !!token,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
