export interface User {
  id: string;
  email: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: any; // For any additional fields
}
