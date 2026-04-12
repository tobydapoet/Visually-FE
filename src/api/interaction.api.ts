import type {
  CommentTargetType,
  LikeTargetType,
  ShareTargetType,
} from "../constants/interaction.enum";
import type {
  CommentPageResponse,
  LikePageResponse,
} from "../types/api/interaction.type";
import type { MentionItem } from "../types/api/mention.type";
import type {
  CommentReqType,
  LikeReqType,
  ReportReqType,
  ShareReqType,
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

export const handleShare = async (data: ShareReqType) => {
  try {
    await axiosInstance.post(
      `${import.meta.env.VITE_API_URL}interactions/share`,
      data,
    );
  } catch (err: any) {
    return {
      success: false,
      message: err.response?.data?.message,
    };
  }
};

export const handleUnshare = async (
  targetId: number,
  targetType: ShareTargetType,
) => {
  try {
    await axiosInstance.delete(
      `${import.meta.env.VITE_API_URL}interactions/share?targetType=${targetType}&targetId=${targetId}`,
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
      `${import.meta.env.VITE_API_URL}interactions/report`,
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
