import * as models from "../../model";

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface MeResponse {
  data: models.User;
}
