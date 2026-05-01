import { createContext, useContext, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import type { ConversationType } from "../types/api/conversation.type";
import type { MemberType, Message } from "../types/api/message.type";
import {
  handleAskBot,
  handledeleteMessage,
  handleGetBotConversation,
  handleGetConversationMembers,
  handleGetConversationMessages,
  handleGetConversationWithId,
  handleGetConversationWithUser,
  handleGetUnReactCount,
  handleGetUserConverstaion,
  handleMuteConversation,
  handleSendMessage,
  handleUnMuteConversation,
  handleUpdateLastSeen,
  handleUpdateMessage,
} from "../api/message.api";
import { useUser } from "./user.context";
import { getSocket } from "../utils/socket";
import { useInfiniteQuery } from "@tanstack/react-query";
import type { MentionItem } from "../types/api/mention.type";
import { toast } from "sonner";
import assets from "../assets";

type MessageContextType = {
  selectedConversation: ConversationType | null;
  messages: Message[];
  loading: boolean;
  inputResetKey: number;
  loadConversationById: (id: number) => Promise<void>;
  handleSelectUser: (userId: string) => Promise<void>;
  handleSelectConversation: (id: number) => Promise<void>;
  unreadConversationCount: number;
  sendMessage: (
    message: string,
    files: File[],
    replyToId?: number,
    mentions?: MentionItem[],
  ) => Promise<void>;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  allConversations: ConversationType[];
  memberList: MemberType[];
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isLoadingConversations: boolean;
  loadingMoreMessages: boolean;
  loadMoreMessages: () => Promise<void>;
  refetchConversations: () => void;
  getBotConversation: () => Promise<void>;
  fetchMember: () => Promise<void>;
  setNullForConversation: () => void;
  updateMessage: (
    id: number,
    content: string,
    mentions?: MentionItem[],
  ) => Promise<void>;
  deleteMessage: (id: number) => Promise<void>;
  muteConversation: (
    memberId: number,
    option: "15m" | "1h" | "8h" | "24h" | "forever",
  ) => Promise<void>;
  unmuteConversation: (memberId: number) => Promise<void>;
  askBot: (content: string) => Promise<void>;
};

const MessageContext = createContext<MessageContextType | null>(null);

export const MessageProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const navigate = useNavigate();
  const { currentUser } = useUser();

  const [selectedConversation, setSelectedConversation] =
    useState<ConversationType | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputResetKey, setInputResetKey] = useState(0);
  const [messagePage, setMessagePage] = useState(1);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [loadingMoreMessages, setLoadingMoreMessages] = useState(false);
  const [memberList, setMemberList] = useState<MemberType[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const selectedConversationRef = useRef<ConversationType | null>(null);
  const [unreadConversationCount, setUnreadConversationCount] = useState(0);

  useEffect(() => {
    selectedConversationRef.current = selectedConversation;
  }, [selectedConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchMember = async () => {
    if (selectedConversation) {
      const res = await handleGetConversationMembers(selectedConversation.id);
      setMemberList(res);
    }
  };

  const fetchUnreadCount = async () => {
    if (!currentUser?.id) return;
    const count = await handleGetUnReactCount();
    setUnreadConversationCount(count);
  };

  useEffect(() => {
    fetchUnreadCount();
  }, [currentUser?.id]);

  useEffect(() => {
    fetchMember();
  }, [selectedConversation?.id]);

  useEffect(() => {
    if (!currentUser?.id) return;
    const socket = getSocket(currentUser.id);

    const handleConnected = () => {
      if (selectedConversationRef.current?.id) {
        joinConversationRoom(selectedConversationRef.current.id);
      }
    };

    if (socket.connected) {
      handleConnected();
    }

    socket.on("connect", handleConnected);
    socket.on("connected", handleConnected);

    socket.on("new_message", (event) => {
      const isOwnMessage = event.senderId === currentUser?.id;
      const isCurrentConversation =
        selectedConversationRef.current?.id === event.conversationId;
      const isMuted = event.mutedUserIds?.includes(currentUser?.id);

      if (!isOwnMessage && !isCurrentConversation && !isMuted) {
        toast.custom(
          (t) => (
            <div
              className="flex items-center gap-3 bg-white shadow-lg rounded-xl p-4 w-80 cursor-pointer"
              onClick={() => {
                window.location.href = `/inbox/${event.conversationId}`;
                toast.dismiss(t);
              }}
            >
              <img
                src={event.senderAvatar || assets.profile}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">
                  {event.senderUsername}
                </p>
                <p className="text-sm text-gray-600 truncate">
                  {event.content}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">Just now</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toast.dismiss(t);
                }}
                className="ml-auto text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
          ),
          { duration: 4000, position: "bottom-right" },
        );
      }

      fetchUnreadCount();
      refetchConversations();

      if (selectedConversationRef.current?.id !== event.conversationId) {
        return;
      }
      setMessages((prev) => {
        if (prev.some((m) => m.id === event.id)) return prev;

        const newMessage = {
          id: event.id,
          content: event.content,
          files: [],
          filePreviews: event.mediaUrls?.map((m: any) => m.url) ?? [],
          createdAt: new Date(event.createdAt),
          isOwn: event.senderId === currentUser.id,
          senderUsername: event.senderUsername,
          senderAvatar: event.senderAvatar,
          replyTo: event.replyToId ?? null,
          mentions: event.mentions,
        };

        const updated = [...prev, newMessage];

        return updated;
      });

      if (selectedConversationRef.current?.id === event.conversationId) {
        handleUpdateLastSeen(event.conversationId);
      }
    });

    socket.on("message_updated", (event) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === event.id
            ? { ...m, content: event.content, mentions: event.mentions ?? [] }
            : m,
        ),
      );
    });
    socket.on("message_deleted", (event) => {
      setMessages((prev) => prev.filter((m) => m.id !== event.messageId));
    });

    return () => {
      socket.off("connect", handleConnected);
      socket.off("connected", handleConnected);
      socket.off("new_message");
      socket.off("message_updated");
      socket.off("message_deleted");
    };
  }, [currentUser?.id]);

  const askBot = async (content: string) => {
    if (!selectedConversation || !content.trim()) return;
    try {
      await handleAskBot(selectedConversation.id, content);
    } catch (err) {
      console.error("Failed to ask bot:", err);
    }
  };

  const getBotConversation = async () => {
    try {
      const res = await handleGetBotConversation();
      setSelectedConversation(res);
      navigate(`/inbox/${res.id}`);
      setMessages([]);
      setInputResetKey((k) => k + 1);
      joinConversationRoom(res.id);
      setMessagePage(1);
      setHasMoreMessages(false);
      await loadMessages(res.id);
      refetchConversations();
    } catch (err) {
      console.error("Failed to create bot conversation:", err);
    }
  };

  const setNullForConversation = () => {
    setSelectedConversation(null);
  };

  const muteConversation = async (
    memberId: number,
    option: "15m" | "1h" | "8h" | "24h" | "forever",
  ) => {
    await handleMuteConversation(memberId, option);
    await fetchMember();
  };

  const unmuteConversation = async (memberId: number) => {
    await handleUnMuteConversation(memberId);
    await fetchMember();
  };

  const loadMessages = async (conversationId: number, page = 1) => {
    try {
      const res = await handleGetConversationMessages(conversationId, page);
      const mapped: Message[] = res.content
        .map((msg: any) => ({
          id: msg.id,
          content: msg.content,
          files: [],
          filePreviews: msg.mediaUrls?.map((m: any) => m.url) ?? [],
          createdAt: new Date(msg.createdAt),
          isOwn: msg.senderId === currentUser?.id,
          senderUsername: msg.senderUsername,
          senderAvatar: msg.senderAvatar,
          replyTo: msg.replyTo ?? null,
          mentions: msg.mentions,
        }))
        .reverse();

      if (page === 1) {
        setMessages(mapped);
      } else {
        setMessages((prev) => [...mapped, ...prev]);
      }

      setHasMoreMessages(page < res.totalPages);
      setMessagePage(page);
    } catch (err) {
      console.error("Failed to load messages:", err);
    }
  };

  const loadMoreMessages = async () => {
    if (!selectedConversation || !hasMoreMessages || loadingMoreMessages)
      return;
    setLoadingMoreMessages(true);
    try {
      await loadMessages(selectedConversation.id, messagePage + 1);
    } finally {
      setLoadingMoreMessages(false);
    }
  };

  const joinConversationRoom = (conversationId: number) => {
    if (!currentUser?.id) return;
    const socket = getSocket(currentUser.id);

    if (socket.connected) {
      socket.emit("join_conversation", { conversationId });
    } else {
      socket.once("connect", () => {
        socket.emit("join_conversation", { conversationId });
      });
    }
  };

  const loadConversationById = async (id: number) => {
    setLoading(true);
    try {
      const res = await handleGetConversationWithId(id);
      setSelectedConversation(res);
      joinConversationRoom(res.id);
      await loadMessages(res.id);
      await handleUpdateLastSeen(res.id);
    } catch (error) {
      console.error("Failed to load conversation:", error);
      navigate("/inbox");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = async (userId: string) => {
    const res = await handleGetConversationWithUser(userId);
    setSelectedConversation(res);
    navigate(`/inbox/${res.id}`);
    setMessages([]);
    setInputResetKey((k) => k + 1);
    joinConversationRoom(res.id);
    setMessagePage(1);
    setHasMoreMessages(false);
    await loadMessages(res.id);
  };

  const handleSelectConversation = async (id: number) => {
    const res = await handleGetConversationWithId(id);
    setSelectedConversation(res);
    navigate(`/inbox/${id}`);
    setMessages([]);
    setInputResetKey((k) => k + 1);
    joinConversationRoom(res.id);
    setMessagePage(1);
    setHasMoreMessages(false);
    await loadMessages(res.id);
    await handleUpdateLastSeen(id);
    refetchConversations();
    fetchUnreadCount();
  };

  const {
    data: conversationsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingConversations,
    refetch: refetchConversations,
  } = useInfiniteQuery({
    queryKey: ["userConversations"],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await handleGetUserConverstaion(pageParam, 10);
      return {
        data: res.content,
        nextPage: res.hasNext ? pageParam + 1 : undefined,
        totalPages: res.totalPages,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
  });

  const allConversations =
    conversationsData?.pages.flatMap((p) => p.data) || [];

  const sendMessage = async (
    message: string,
    files: File[],
    replyToId?: number,
    mentions?: MentionItem[],
  ) => {
    if (!message.trim() && files.length === 0) return;
    console.log("mentions: ", mentions);
    const formData = new FormData();
    formData.append("conversationId", String(selectedConversation!.id));
    formData.append("senderId", currentUser!.id);
    formData.append("content", message);
    if (replyToId) formData.append("replyToMessageId", String(replyToId));
    mentions?.forEach((mention, index) => {
      formData.append(`mentions[${index}][userId]`, mention.userId);
      formData.append(`mentions[${index}][username]`, mention.username);
    });
    files.forEach((file) => formData.append("files", file));
    try {
      await handleSendMessage(formData);
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  const updateMessage = async (
    id: number,
    message: string,
    mentions?: MentionItem[],
  ) => {
    try {
      await handleUpdateMessage(
        id,
        message,
        mentions?.map(({ userId, username }) => ({ userId, username })) ?? [],
      );
    } catch (err) {
      console.error("Failed to update message:", err);
    }
  };

  const deleteMessage = async (id: number) => {
    try {
      await handledeleteMessage(id);
    } catch (err) {
      console.error("Failed to delete message:", err);
    }
  };

  return (
    <MessageContext.Provider
      value={{
        selectedConversation,
        messages,
        loading,
        inputResetKey,
        loadConversationById,
        handleSelectUser,
        handleSelectConversation,
        sendMessage,
        messagesEndRef,
        allConversations,
        fetchNextPage,
        hasNextPage,
        unreadConversationCount,
        isFetchingNextPage,
        isLoadingConversations,
        loadingMoreMessages,
        loadMoreMessages,
        refetchConversations,
        memberList,
        fetchMember,
        setNullForConversation,
        updateMessage,
        deleteMessage,
        muteConversation,
        unmuteConversation,
        askBot,
        getBotConversation,
      }}
    >
      {children}
    </MessageContext.Provider>
  );
};

export const useMessage = () => {
  const context = useContext(MessageContext);
  if (!context)
    throw new Error("useMessage must be used within MessageProvider");
  return context;
};
