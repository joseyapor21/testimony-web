const TOKEN_KEY = 'auth_token';
const BASE_URL = 'http://localhost:3001';

export const AuthService = {
  getAuthToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  setAuthToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  },

  clearAuthToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  },

  isAuthenticated(): boolean {
    const token = this.getAuthToken();
    return token !== null && token.length > 0;
  },

  getHeaders(): Record<string, string> {
    const token = this.getAuthToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'x-access-token': token } : {}),
    };
  },

  async login(email: string, password: string): Promise<boolean> {
    try {
      const response = await fetch(`${BASE_URL}/api/login/v4`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.token) {
          this.setAuthToken(data.token);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  },

  logout(): void {
    this.clearAuthToken();
  },
};
