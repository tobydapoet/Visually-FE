import type {
  CommentTargetType,
  LikeTargetType,
  SaveTargetType,
} from "../constants/interaction.enum";
import type {
  CommentPageResponse,
  LikePageResponse,
  ReportListPageResponse,
  ReportPageResponse,
} from "../types/api/interaction.type";
import type { MentionItem } from "../types/api/mention.type";
import type {
  CommentReqType,
  LikeReqType,
  ReportReqType,
  SaveReqType,
} from "../types/schemas/interaction.schema";
import axiosInstance from "../utils/axiosInstance";

export const handleLike = async (data: LikeReqType) => {
  try {
    await axiosInstance.post(
      `${import.meta.env.VITE_API_URL}interactions/like`,
      data,
    );
  } catch (err: any) {
    return {
      success: false,
      message: err.response?.data?.message,
    };
  }
};

export const handleDislike = async (data: LikeReqType) => {
  try {
    await axiosInstance.delete(
      `${import.meta.env.VITE_API_URL}interactions/like?targetType=${data.targetType}&targetId=${data.targetId}`,
    );
  } catch (err: any) {
    return {
      success: false,
      message: err.response?.data?.message,
    };
  }
};

export const handleComment = async (data: CommentReqType) => {
  try {
    const res = await axiosInstance.post(
      `${import.meta.env.VITE_API_URL}interactions/comment`,
      data,
    );
    return {
      success: true,
      data: res.data,
    };
  } catch (err: any) {
    console.error("ERROR:", err);

    return {
      success: false,
      message: err.response?.data?.message,
    };
  }
};

export const handleSave = async (data: SaveReqType) => {
  try {
    await axiosInstance.post(
      `${import.meta.env.VITE_API_URL}interactions/save`,
      data,
    );
  } catch (err: any) {
    console.log("err: ", err.response.data);

    return {
      success: false,
      message: err.response?.data?.message,
    };
  }
};

export const handleUnsave = async (
  targetId: number,
  targetType: SaveTargetType,
) => {
  try {
    await axiosInstance.delete(
      `${import.meta.env.VITE_API_URL}interactions/save?targetType=${targetType}&targetId=${targetId}`,
    );
  } catch (err: any) {
    return {
      success: false,
      message: err.response?.data?.message,
    };
  }
};

export const handleReport = async (data: ReportReqType) => {
  try {
    const res = await axiosInstance.post(
      `${import.meta.env.VITE_API_URL}interactions/report/target`,
      data,
    );
    return {
      success: true,
      message: res.data.message,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.response?.data?.message,
    };
  }
};

export const handleGetReport = async (
  targetId: number,
  targetType: CommentTargetType,
  page = 1,
  size = 15,
): Promise<ReportPageResponse> => {
  const res = await axiosInstance.get(
    `${import.meta.env.VITE_API_URL}interactions/report/target?targetId=${targetId}&targetType=${targetType}&page=${page}&size=${size}`,
  );
  return res.data;
};

export const handleGetCommentByTarget = async (
  targetId: number,
  targetType: CommentTargetType,
  page = 1,
  size = 15,
): Promise<CommentPageResponse> => {
  const res = await axiosInstance.get(
    `${import.meta.env.VITE_API_URL}interactions/comment/target?targetId=${targetId}&targetType=${targetType}&page=${page}&size=${size}`,
  );
  return res.data;
};

export const handleGetLikeByTarget = async (
  targetId: number,
  targetType: LikeTargetType,
  page = 1,
  size = 15,
): Promise<LikePageResponse> => {
  const res = await axiosInstance.get(
    `${import.meta.env.VITE_API_URL}interactions/like/target?targetId=${targetId}&targetType=${targetType}&page=${page}&size=${size}`,
  );
  return res.data;
};

export const handleGetListReport = async (
  page = 1,
  size = 20,
  keyword?: string,
): Promise<ReportListPageResponse> => {
  const res = await axiosInstance.get(
    `${import.meta.env.VITE_API_URL}interactions/report?page=${page}&size=${size}${keyword ? `&keyword=${keyword}` : ""}`,
  );
  return res.data;
};

export const handleGetRepliesComment = async (
  commentId: number,
  page = 1,
  size = 10,
): Promise<CommentPageResponse> => {
  const res = await axiosInstance.get(
    `${import.meta.env.VITE_API_URL}interactions/comment/reply?commentId=${commentId}&page=${page}&size=${size}`,
  );
  return res.data;
};

export const handleUpdateComment = async (
  id: number,
  content: string,
  mentions?: MentionItem[],
) => {
  try {
    await axiosInstance.put(
      `${import.meta.env.VITE_API_URL}interactions/comment/${id}`,
      { content, mentions },
    );
  } catch (err: any) {
    console.log(err.response);
  }
};

export const handleDeleteComment = async (id: number) => {
  try {
    await axiosInstance.delete(
      `${import.meta.env.VITE_API_URL}interactions/comment/${id}`,
    );
  } catch (err: any) {
    console.log(err.response);
  }
};

export const handleDeleteMany = async (ids: number[]) => {
  await axiosInstance.delete(
    `${import.meta.env.VITE_API_URL}interactions/report`,
    {
      data: { ids },
    },
  );
};

export const handleView = async (
  targetId: number,
  targetType: "POST" | "SHORT" | "STORY",
  watchTime: number,
) => {
  await axiosInstance.post(`${import.meta.env.VITE_API_URL}interactions/view`, {
    targetId,
    targetType,
    watchTime,
  });
};
