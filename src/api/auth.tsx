import api from "./axios";

export const register = async ({ username, email, password }) => {
    const response = await api.post("/register", {
        username,
        email,
        password,
    });

    return response.data;
};