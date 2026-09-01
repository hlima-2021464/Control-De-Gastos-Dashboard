// =============================================================
// Auth domain models — Frontend
// =============================================================

export interface LoginRequest {
  identifier: string; // email o username
  password:   string;
}

export interface UserProfile {
  id:         number | string;
  username:   string;
  name?:      string;
  email:      string;
  picture?:   string;
  avatarUrl?: string;
  role:       'ADMIN' | 'USER';
  created_at: string;
  updated_at: string;
}

export interface AuthSuccessResponse {
  status:  'success';
  message: string;
  data: {
    user:  UserProfile;
    token: string;
  };
}

export interface AuthErrorResponse {
  status:  'error';
  message: string;
}
