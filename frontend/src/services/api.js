const API_BASE = '/api/v1';

export const loginUser = async (email, password) => {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Login failed');
  }
  return data;
};

export const fetchEvents = async () => {
  const response = await fetch(`${API_BASE}/events`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch events');
  }
  return data.events || [];
};

export const bookTicket = async (eventId, quantity, token) => {
  const response = await fetch(`${API_BASE}/tickets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ eventId, quantity })
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to book tickets');
  }
  return data;
};

export const fetchMyTickets = async (token) => {
  const response = await fetch(`${API_BASE}/tickets/my`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch tickets');
  }
  return data.tickets || [];
};

export const updateTicketStatus = async (ticketId, status, token) => {
  const response = await fetch(`${API_BASE}/tickets/${ticketId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ status })
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to update ticket status');
  }
  return data;
};
