import type { LoginType } from "../types/schemas/login.schema";
import axios from "axios";
import type { RegisterType } from "../types/schemas/register.schema";
import Cookies from "js-cookie";
import axiosInstance from "../utils/axiosInstance";

export const handleLogin = async (req: LoginType) => {
  try {
    const res = await axios.post(
      `${import.meta.env.VITE_API_URL}users/auth/login`,
      req,
    );
    const access_token = res.data.accessToken;
    const refresh_token = res.data.refreshToken;
    if (req.remember) {
      Cookies.set("access_token", access_token, { expires: 1 });
      Cookies.set("refresh_token", refresh_token, { expires: 7 });
    } else {
      Cookies.set("access_token", access_token);
      Cookies.set("refresh_token", refresh_token);
    }
    return {
      success: true,
      access_token,
      refresh_token,
    };
  } catch (err: any) {
    const message = err.response?.data?.message;
    return {
      success: false,
      message,
    };
  }
};

export const handleRegister = async (req: RegisterType) => {
  try {
    const res = await axios.post(
      `${import.meta.env.VITE_API_URL}users/auth/register`,
      req,
    );
    return {
      success: true,
      message: res.data.message,
    };
  } catch (err: any) {
    const message = err.response?.data?.message;
    return {
      success: false,
      message,
    };
  }
};

export const handleLogout = async () => {
  try {
    const res = await axiosInstance.delete(
      `${import.meta.env.VITE_API_URL}users/auth/logout`,
    );
    return {
      success: true,
      message: res.data.message,
    };
  } catch (err: any) {
    const message = err.response?.data?.message;
    return {
      success: false,
      message,
    };
  }
};
