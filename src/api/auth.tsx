import api from "./axios";
import * as authI from "./interface/authInterface";

export const register = async ({
  username,
  email,
  password,
}: authI.RegisterRequest) => {
  const response = await api.post("/register", {
    username,
    email,
    password,
  });

  return response.data;
};

export const login = async ({ email, password }: authI.LoginRequest) => {
  const response = await api.post("/login", {
    email,
    password,
  });

  return response.data;
};

export const getUser = async (): Promise<authI.MeResponse> => {
  const response = await api.get("/me");
  return response.data;
};
