export interface UserResponse {
  id: number;
  hash: string;
  name: string;
  login: string;
  email: string;
  remember: string;
  type: string;
  person: string;
  status: number;
  created_at: string;
  updated_at: string;
  date: string;
  phone: string;
  cep: string;
}

export interface ApiResponse {
  response: boolean;
  data: UserResponse;
}