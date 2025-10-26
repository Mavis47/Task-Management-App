import axios from "axios";

const API_URL = "http://localhost:5000/api/admin/getAllUsers";
const CREATE_API_URL = "http://localhost:5000/api/admin/createUser"
const UPDATE_API_URL = "http://localhost:5000/api/admin/updateUser"
const DELETE_API_URL = "http://localhost:5000/api/admin/deleteUser"

export const getAllUsers = async (token: string) => {
  try {
    const res = await axios.get(API_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (error: any) {
    console.error("Error fetching users:", error.response?.data || error.message);
    throw error;
  }
};

export const createUser = async (user: { email: string; password: string; role: string }, token: string) => {
  const res = await axios.post(CREATE_API_URL, user, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const updateUser = async (id: number, user: { email?: string; role?: string }, token: string) => {
  const res = await axios.put(`${UPDATE_API_URL}/${id}`, user, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const deleteUser = async (id: number, token: string) => {
  const res = await axios.delete(`${DELETE_API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};