import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api/";

const api = axios.create({
    baseURL: API_URL,
});

export const login = (username, password) =>
    api.post("auth/login/", { username, password });

export const refreshToken = (refresh) =>
    api.post("auth/refresh/", { refresh });

export const getUsers = (token) =>
  api.get("users/", { headers: { Authorization: `Bearer ${token}` } });

export const createUser = (token, data) =>
  api.post("users/", data, { headers: { Authorization: `Bearer ${token}` } });

export const updateUser = (token, id, data) =>
  api.patch(`users/${id}/`, data, { headers: { Authorization: `Bearer ${token}` } });

export const deleteUser = (token, id) =>
  api.delete(`users/${id}/`, { headers: { Authorization: `Bearer ${token}` } });



export const getProducts = (token) =>
    api.get("products/", { headers: { Authorization: `Bearer ${token}` } });

export const getOrders = (token) =>
    api.get("orders/", { headers: { Authorization: `Bearer ${token}` } });

export const getInvitations = (token) =>
    api.get("invitations/", { headers: { Authorization: `Bearer ${token}` } });

export const sendInvitation = (token, data) =>
    api.post("invitations/", data, { headers: { Authorization: `Bearer ${token}` } });

export const resendInvitation = (token, id) =>
  api.post(`/invitations/${id}/resend/`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });

export const revokeInvitation = (token, id) =>
  api.post(`/invitations/${id}/revoke/`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
