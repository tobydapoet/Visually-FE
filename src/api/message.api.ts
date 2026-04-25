import type { ConversationType } from "../types/api/conversation.type";
import type { MentionItem } from "../types/api/mention.type";
import type { MemberType } from "../types/api/message.type";
import type { CreateConversationType } from "../types/schemas/converstation.schema";
import axiosInstance from "../utils/axiosInstance";

export const handleCreateConverstaion = async (
  memberIds: string,
  name?: string,
) => {
  const res = await axiosInstance.post(
    `${import.meta.env.VITE_API_URL}messages/conversation`,
    { memberIds, name },
  );
  return res.data;
};

export const handleGetUserConverstaion = async (
  page = 1,
  size = 10,
  keyword?: string,
) => {
  const res = await axiosInstance.get(
    `${import.meta.env.VITE_API_URL}messages/conversation?page=${page}&size=${size}${keyword ? `&keyword=${keyword}` : ""}`,
  );

  return res.data;
};

export const handleGetConversationWithUser = async (
  userId: string,
): Promise<ConversationType> => {
  const res = await axiosInstance.get(
    `${import.meta.env.VITE_API_URL}messages/conversation/user/${userId}`,
  );

  return res.data;
};

export const handleGetConversationWithId = async (
  id: number,
): Promise<ConversationType> => {
  const res = await axiosInstance.get(
    `${import.meta.env.VITE_API_URL}messages/conversation/${id}`,
  );
  console.log("RESDATA: ", res.data);

  return res.data;
};

export const handleSendMessage = async (formData: FormData) => {
  try {
    const res = await axiosInstance.post(
      `${import.meta.env.VITE_API_URL}messages/message`,
      formData,
    );

    return res.data;
  } catch (err: any) {
    console.log(err);
    throw err;
  }
};

export const handleUpdateMessage = async (
  id: number,
  content: string,
  mentions?: MentionItem[],
) => {
  try {
    await axiosInstance.put(
      `${import.meta.env.VITE_API_URL}messages/message/${id}`,
      { content, mentions },
    );
  } catch (err: any) {
    console.log(err.response);
  }
};

export const handledeleteMessage = async (id: number) => {
  await axiosInstance.delete(
    `${import.meta.env.VITE_API_URL}messages/message/${id}`,
  );
};

export const handleCreateConversation = async (
  data: CreateConversationType,
) => {
  try {
    const res = await axiosInstance.post(
      `${import.meta.env.VITE_API_URL}messages/conversation`,
      data,
    );
    return {
      success: true,
      message: res.data.message,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.response?.data?.message || "Create failed",
    };
  }
};

export const handleGetConversationMessages = async (
  conversationId: number,
  page = 1,
  size = 20,
  keyword?: string,
) => {
  const res = await axiosInstance.get(
    `${import.meta.env.VITE_API_URL}messages/message/conversation/${conversationId}?page=${page}&size=${size}${keyword ? `&keyword=${keyword}` : ""}`,
  );
  return res.data;
};

export const handleUpdateLastSeen = async (conversationId: number) => {
  await axiosInstance.put(
    `${import.meta.env.VITE_API_URL}messages/conversation-member/conversation/${conversationId}/seen`,
  );
};

export const handleUpdateConversation = async (
  id: number,
  formData: FormData,
) => {
  try {
    const res = await axiosInstance.put(
      `${import.meta.env.VITE_API_URL}messages/conversation/${id}`,
      formData,
    );
    return {
      success: true,
      message: res.data.message,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.response?.data?.message || "Create failed",
    };
  }
};

export const handleGetConversationMembers = async (
  conversationId: number,
): Promise<MemberType[]> => {
  const res = await axiosInstance.get(
    `${import.meta.env.VITE_API_URL}messages/conversation-member/conversation/${conversationId}`,
  );
  console.log("RES: ", res.data);
  return res.data;
};

export const handleRemoveMemberFromConversation = async (memberId: number) => {
  try {
    const res = await axiosInstance.put(
      `${import.meta.env.VITE_API_URL}messages/conversation-member/remove/${memberId}`,
    );
    return {
      success: true,
      message: res.data.message,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.response?.data?.message || "Remove failed",
    };
  }
};

export const handleInviteMemberFromConversation = async (
  conversationId: number,
  userIds: string[],
) => {
  try {
    await axiosInstance.post(
      `${import.meta.env.VITE_API_URL}messages/conversation-member`,
      { conversationId, userIds },
    );
  } catch (err: any) {
    console.log(err);
  }
};

export const handleSeachMember = async (
  conversationId: number,
  keyword: string,
): Promise<MemberType[]> => {
  const res = await axiosInstance.get(
    `${import.meta.env.VITE_API_URL}messages/conversation-member/conversation/${conversationId}/search?keyword=${keyword}`,
  );
  return res.data;
};
