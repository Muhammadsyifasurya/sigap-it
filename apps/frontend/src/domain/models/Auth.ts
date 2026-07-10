export interface User {
  id: number;
  name: string;
  email: string;
  role: {
    id: number;
    name: string;
  };
  department: {
    id: number;
    name: string;
  };
}

export interface AuthResponse {
  access_token: string;
}
