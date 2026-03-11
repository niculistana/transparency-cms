export type Role = {
  role_id?: number;
  role_name?: string;
  description?: string;
  permissions?: Record<string, boolean>;
  created_at?: string;
  updated_at?: string;
};
