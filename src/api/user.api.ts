import type { UserRole } from "../constants/userRole.enum";
import type { UserStatus } from "../constants/userStatus";
import type {
  CurrentUserType,
  UserPageResponse,
  UserStatusPageResponse,
  UserType,
} from "../types/api/user.type";
import axiosInstance from "../utils/axiosInstance";

export const handleGetUser = async (
  username: string,
): Promise<UserType | null> => {
  try {
    const res = await axiosInstance.get(
      `${import.meta.env.VITE_API_URL}users/account/username/${username}`,
    );

    return res.data;
  } catch (error: any) {
    console.log(error.response?.data?.message);
    return null;
  }
};

export const handleGetCurrentUser =
  async (): Promise<CurrentUserType | null> => {
    try {
      const res = await axiosInstance.get(
        `${import.meta.env.VITE_API_URL}users/account/current`,
      );
      return res.data;
    } catch (err: any) {
      console.log(err);
      return null;
    }
  };

export const handleUpdateUser = async (data: FormData) => {
  try {
    const res = await axiosInstance.put(
      `${import.meta.env.VITE_API_URL}users/account`,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return {
      success: true,
      message: res.data.message,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.response?.data?.message || "Update failed",
    };
  }
};

export const handleUpdateUserStatus = async (
  id: string,
  status: UserStatus,
) => {
  try {
    await axiosInstance.put(
      `${import.meta.env.VITE_API_URL}users/account/${id}/status?status=${status}`,
    );
  } catch (err: any) {
    return {
      success: false,
      message: err.response?.data?.message || "Update failed",
    };
  }
};

export const handleUpdateUserRole = async (id: string, role: UserRole) => {
  try {
    await axiosInstance.put(
      `${import.meta.env.VITE_API_URL}users/account/${id}/role?role=${role}`,
    );
  } catch (err: any) {
    console.log(err);
    return {
      success: false,
      message: err.response?.data?.message || "Update failed",
    };
  }
};

export const handleSearchUser = async (
  keyword: string,
  page: number,
  size: number,
  isExclude = false,
): Promise<UserPageResponse> => {
  const res = await axiosInstance.get(
    `${import.meta.env.VITE_API_URL}users/account/search?keyword=${keyword}&page=${page}&size=${size}${isExclude ? `&isExclude=true` : ""}`,
  );
  return res.data;
};

export const handleSearchUserWithRole = async (
  role: UserRole,
  page: number,
  size: number,
  keyword?: string,
): Promise<UserStatusPageResponse> => {
  const res = await axiosInstance.get(
    `${import.meta.env.VITE_API_URL}users/account/role?role=${role}&page=${page}&size=${size}${keyword ? `&keyword=${keyword}` : ""}`,
  );

  return res.data;
};
