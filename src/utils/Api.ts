const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const ApiFetch = {
  get: async (endpoint: string) => {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Vital para que Next.js envíe tu JWT de las cookies
    });
    if (!res.ok) throw new Error('Error en GET');
    return res.json();
  },

  post: async (endpoint: string, data: any) => {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error en POST');
    return res.json();
  },
};