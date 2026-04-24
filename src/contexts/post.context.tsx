import { createContext, useContext, useState, type ReactNode } from "react";
import type {
  PostDetailResponse,
  PostResponsePage,
} from "../types/api/post.type";
import type { ContentMangePageResponse } from "../types/api/content.type";
import type { ContentStatus } from "../constants/contentStatus.enum";
import {
  handleCreatePost,
  handleGetPost,
  handleGetPostByUser,
  handleUpdatePostStatus,
  hanleGetPostByStatus,
} from "../api/post.api";
import { toast } from "sonner";

type PostContextType = {
  loading: boolean;

  postDetail: PostDetailResponse | null;
  postByUser: PostResponsePage | null;
  postByStatus: ContentMangePageResponse | null;

  getPostDetail: (id: number) => Promise<void>;
  getPostByUser: (
    userId: string,
    page?: number,
    size?: number,
  ) => Promise<void>;
  getPostByStatus: (
    status: ContentStatus,
    page?: number,
    size?: number,
    keyword?: string,
  ) => Promise<void>;

  createPost: (formData: FormData) => Promise<boolean>;

  updatePostStatus: (
    postId: number,
    status: ContentStatus,
    onSuccess?: () => void,
  ) => Promise<boolean>;
};

const PostContext = createContext<PostContextType | undefined>(undefined);

export const PostProvider = ({ children }: { children: ReactNode }) => {
  const [loading, setLoading] = useState(false);

  const [postDetail, setPostDetail] = useState<PostDetailResponse | null>(null);
  const [postByUser, setPostByUser] = useState<PostResponsePage | null>(null);
  const [postByStatus, setPostByStatus] =
    useState<ContentMangePageResponse | null>(null);

  const getPostDetail = async (id: number) => {
    try {
      setLoading(true);
      const res = await handleGetPost(id);
      setPostDetail(res);
    } finally {
      setLoading(false);
    }
  };

  const getPostByUser = async (userId: string, page = 1, size = 10) => {
    try {
      setLoading(true);
      const res = await handleGetPostByUser(userId, page, size);
      setPostByUser(res);
    } finally {
      setLoading(false);
    }
  };

  const getPostByStatus = async (
    status: ContentStatus,
    page = 1,
    size = 10,
    keyword?: string,
  ) => {
    try {
      setLoading(true);
      const res = await hanleGetPostByStatus(status, page, size, keyword);
      setPostByStatus(res);
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (formData: FormData): Promise<boolean> => {
    try {
      setLoading(true);
      const res = await handleCreatePost(formData);
      return res.success;
    } finally {
      setLoading(false);
    }
  };

  const updatePostStatus = async (
    post: number,
    status: ContentStatus,
    onSuccess?: () => void,
  ): Promise<boolean> => {
    try {
      setLoading(true);
      const res = await handleUpdatePostStatus(post, status);

      if (res.success) {
        toast.success(res.data.message);
        onSuccess?.();
        return true;
      }

      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <PostContext.Provider
      value={{
        loading,
        postDetail,
        postByUser,
        postByStatus,
        getPostDetail,
        getPostByUser,
        getPostByStatus,
        createPost,
        updatePostStatus,
      }}
    >
      {children}
    </PostContext.Provider>
  );
};

export const usePost = () => {
  const context = useContext(PostContext);
  if (!context) {
    throw new Error("usePost must be used within PostProvider");
  }
  return context;
};
