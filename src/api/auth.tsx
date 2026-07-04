import api from "./axios";
import * as authI from "./interface";

export const register = async ({ username, email, password }: authI.RegisterRequest) => {
    const response = await api.post("/register", {
        username,
        email,
        password,
    });

    return response.data;
};