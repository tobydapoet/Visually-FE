import type React from "react";
import SideBarMessage from "../components/SideBarMessage";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import assets from "../assets";
import { CircularProgress } from "@mui/material";
import MessageInput, { type MessageInputRef } from "../components/MessageInput";
import { useMessage } from "../contexts/message.context";
import { useUser } from "../contexts/user.context";
import {
  Ban,
  EllipsisVertical,
  Eraser,
  Pencil,
  Reply,
  X,
  ChevronLeft,
  BotMessageSquare,
} from "lucide-react";
import DetailConversation from "./DetailConversation";
import type { Message } from "../types/api/message.type";
import { ParsedContent } from "../components/ParseContent";
import { timeAgo } from "../utils/timeAgot";

const MessagePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useUser();
  const {
    selectedConversation,
    messages,
    loading,
    inputResetKey,
    loadConversationById,
    sendMessage,
    messagesEndRef,
    loadMoreMessages,
    loadingMoreMessages,
    updateMessage,
    deleteMessage,
    askBot,
  } = useMessage();

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const isLoadingMore = useRef(false);
  const prevScrollHeight = useRef(0);
  const [isOpenDetail, setIsOpenDetail] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const messageInputRef = useRef<MessageInputRef>(null);
  const navigate = useNavigate();

  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const [showSidebar, setShowSidebar] = useState(!id);
  const [isAskingBot, setIsAskingBot] = useState(false);

  console.log("SELECTED: ", selectedConversation);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setShowSidebar(true);
    };
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (id && currentUser) {
      loadConversationById(Number(id)).then(() => {
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "instant" });
        }, 0);
        if (isMobile) setShowSidebar(false);
      });
    } else {
      // No id → show sidebar on mobile
      if (isMobile) setShowSidebar(true);
    }
  }, [id, currentUser, isMobile]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    if (isLoadingMore.current) {
      const diff = container.scrollHeight - prevScrollHeight.current;
      container.scrollTop = diff;
      isLoadingMore.current = false;
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    prevScrollHeight.current = container.scrollHeight;
  }, [messages]);

  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;
    if (container.scrollTop < 100) {
      prevScrollHeight.current = container.scrollHeight;
      isLoadingMore.current = true;
      loadMoreMessages();
    }
  };

  const handleBackToSidebar = () => {
    setShowSidebar(true);
    navigate("/inbox");
  };

  return (
    <div
      className={`w-full  ${isMobile ? "h-calc(100vh-20rem)" : "h-screen"} flex overflow-hidden bg-zinc-900`}
    >
      <div
        className={`
          ${isMobile ? (showSidebar ? "flex w-full" : "hidden") : "flex"}
          shrink-0
        `}
      >
        <SideBarMessage />
      </div>

      <div
        className={`
          flex-1 flex overflow-hidden
          ${isMobile && showSidebar ? "hidden" : "flex"}
        `}
      >
        {loading && (
          <div className="h-full flex-1 flex items-center justify-center">
            <CircularProgress size={40} sx={{ color: "#a1a1aa" }} />
          </div>
        )}

        {!loading && selectedConversation ? (
          <div className="h-full flex flex-1 overflow-hidden">
            <div className="flex flex-col flex-1 min-w-0">
              <div className="w-full flex justify-between items-center border-b border-gray-600 p-4 bg-zinc-900">
                <div className="flex items-center gap-2">
                  {isMobile && (
                    <button
                      onClick={handleBackToSidebar}
                      className="p-2 hover:bg-zinc-800 rounded-full transition-colors"
                    >
                      <ChevronLeft size={20} className="text-white" />
                    </button>
                  )}

                  <div className="flex items-center gap-2 relative">
                    {selectedConversation.otherUsers.length > 1 ? (
                      <div className="flex">
                        {selectedConversation.type === "GROUP" ? (
                          selectedConversation.mediaUrl ? (
                            <img
                              src={selectedConversation.mediaUrl}
                              className="w-10 h-10 rounded-full object-cover"
                              alt="group"
                            />
                          ) : (
                            <div className="flex">
                              {selectedConversation.otherUsers
                                .slice(0, 3)
                                .map((user, index) => (
                                  <img
                                    key={user.userId}
                                    src={user.avatarUrl || assets.profile}
                                    alt={
                                      selectedConversation.name || user.username
                                    }
                                    className="w-8 h-8 rounded-full object-cover border-2 border-zinc-900"
                                    style={{
                                      marginLeft: index === 0 ? "0" : "-15px",
                                      zIndex: 3 - index,
                                    }}
                                  />
                                ))}
                            </div>
                          )
                        ) : (
                          <img
                            src={
                              selectedConversation.otherUsers[0].avatarUrl ||
                              assets.profile
                            }
                            alt={
                              selectedConversation.name ||
                              selectedConversation.otherUsers[0].username
                            }
                            className="w-10 h-10 rounded-full object-cover cursor-pointer"
                            onClick={() =>
                              navigate(
                                `/${selectedConversation.otherUsers[0].username}`,
                              )
                            }
                          />
                        )}
                      </div>
                    ) : (
                      <div className="relative">
                        <img
                          src={
                            selectedConversation.otherUsers[0].avatarUrl ||
                            assets.profile
                          }
                          alt={
                            selectedConversation.name ||
                            selectedConversation.otherUsers[0].username
                          }
                          className="w-10 h-10 cursor-pointer rounded-full object-cover"
                          onClick={() =>
                            navigate(
                              `/${selectedConversation.otherUsers[0].username}`,
                            )
                          }
                        />
                        {selectedConversation.otherUsers[0].lastSeen ===
                          null && (
                          <span className="absolute bottom-0 -right-0.5 w-3 h-3 bg-green-500 border-2 border-gray-800 rounded-full" />
                        )}
                      </div>
                    )}
                    <div className="flex flex-col">
                      <div className="font-bold text-white">
                        {selectedConversation.name ||
                          selectedConversation.otherUsers[0]?.username ||
                          "Unknown"}
                      </div>
                      {!selectedConversation.name && (
                        <div className="text-xs text-gray-400">
                          {selectedConversation.otherUsers[0].lastSeen === null
                            ? "Active now"
                            : `Active ${timeAgo(selectedConversation.otherUsers[0].lastSeen)} ago`}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  className="cursor-pointer p-2 hover:bg-zinc-800 rounded-full transition-colors"
                  onClick={() => setIsOpenDetail((prev) => !prev)}
                >
                  <EllipsisVertical size={20} className="text-white" />
                </button>
              </div>

              <div
                ref={messagesContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto p-4 space-y-3"
              >
                {messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-gray-500">
                    No messages yet. Start a conversation!
                  </div>
                ) : (
                  <>
                    {loadingMoreMessages && (
                      <div className="flex justify-center py-2">
                        <CircularProgress size={24} sx={{ color: "#a1a1aa" }} />
                      </div>
                    )}
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`group relative flex items-start gap-2 ${msg.isOwn ? "justify-end" : "justify-start"}`}
                      >
                        {!msg.isOwn && !isMobile && (
                          <img
                            src={msg.senderAvatar || assets.profile}
                            className="w-8 h-8 rounded-full object-cover my-auto"
                            alt={msg.senderUsername}
                          />
                        )}

                        <div
                          className={`flex flex-col max-w-[85%] sm:max-w-[70%] ${msg.isOwn ? "items-end" : "items-start"}`}
                        >
                          {!msg.isOwn && (
                            <span className="text-xs text-gray-400 mb-1 ml-1">
                              {msg.senderUsername}
                            </span>
                          )}

                          <div className="group relative flex">
                            {!isMobile &&
                              !msg.isOwn &&
                              !selectedConversation.isBlocked && (
                                <div className="opacity-0 flex order-1 items-center group-hover:opacity-100 transition-all duration-200 mr-1">
                                  <button
                                    onClick={() => setReplyTo(msg)}
                                    className="p-2 rounded-full hover:bg-gray-600 transition-all duration-200 cursor-pointer"
                                    title="Reply"
                                  >
                                    <Reply
                                      size={18}
                                      className="text-gray-300"
                                    />
                                  </button>
                                </div>
                              )}

                            {!isMobile &&
                              msg.isOwn &&
                              !selectedConversation.isBlocked && (
                                <div className="mr-2 opacity-0 group-hover:opacity-100 transition-all duration-200 flex gap-2 items-center">
                                  <button
                                    onClick={() => setReplyTo(msg)}
                                    title="Reply"
                                    className="p-2 rounded-full hover:bg-gray-600 transition-all duration-200 cursor-pointer"
                                  >
                                    <Reply
                                      size={18}
                                      className="text-gray-300"
                                    />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setEditingId(msg.id);
                                      messageInputRef.current?.setText(
                                        msg.content,
                                        msg.mentions,
                                      );
                                    }}
                                    className="p-2 rounded-full hover:bg-blue-500 transition-all duration-200 cursor-pointer shadow-lg group/edit"
                                    title="Edit message"
                                  >
                                    <Pencil
                                      size={18}
                                      className="text-gray-300 group-hover/edit:text-white"
                                    />
                                  </button>
                                  <button
                                    onClick={() => deleteMessage(msg.id)}
                                    className="p-2 rounded-full cursor-pointer hover:bg-red-500 transition-all duration-200 shadow-lg group/delete"
                                    title="Delete message"
                                  >
                                    <Eraser
                                      size={18}
                                      className="text-gray-300 group-hover/delete:text-white"
                                    />
                                  </button>
                                </div>
                              )}

                            {isMobile && !selectedConversation.isBlocked && (
                              <div className="absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => {
                                    if (msg.isOwn) {
                                      setEditingId(msg.id);
                                      messageInputRef.current?.setText(
                                        msg.content,
                                        msg.mentions,
                                      );
                                    } else {
                                      setReplyTo(msg);
                                    }
                                  }}
                                  className="p-1 rounded-full bg-zinc-800"
                                >
                                  {msg.isOwn ? (
                                    <Pencil
                                      size={14}
                                      className="text-gray-300"
                                    />
                                  ) : (
                                    <Reply
                                      size={14}
                                      className="text-gray-300"
                                    />
                                  )}
                                </button>
                              </div>
                            )}

                            <div
                              className={`rounded-lg p-3 ${msg.isOwn ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-100"}`}
                            >
                              {(msg.files?.length > 0 ||
                                msg.filePreviews?.length > 0) && (
                                <div className="flex flex-wrap gap-2 mb-2">
                                  {msg.filePreviews.map((preview, index) => (
                                    <img
                                      key={index}
                                      src={preview}
                                      alt={`media-${index}`}
                                      className="max-w-40 max-h-40 rounded-lg object-cover"
                                    />
                                  ))}
                                </div>
                              )}

                              {msg.replyTo && (
                                <div
                                  className={`text-xs mb-2 px-2 py-1 rounded border-l-2 cursor-pointer ${
                                    msg.isOwn
                                      ? "border-blue-300 bg-blue-700/50 text-blue-200"
                                      : "border-gray-400 bg-gray-600/50 text-gray-300"
                                  }`}
                                >
                                  {msg.replyTo.isDeleted ? (
                                    <p className="italic">Tin nhắn đã bị xóa</p>
                                  ) : (
                                    <>
                                      <p className="font-semibold">
                                        {msg.replyTo.username}
                                      </p>
                                      <p className="truncate">
                                        {msg.replyTo.content}
                                      </p>
                                    </>
                                  )}
                                </div>
                              )}

                              {msg.content && (
                                <div className="wrap-break-word">
                                  <ParsedContent
                                    caption={msg.content}
                                    mentions={msg.mentions}
                                    classname="font-bold hover:underline cursor-pointer"
                                  />
                                </div>
                              )}

                              <span
                                className={`text-[10px] mt-1 block ${msg.isOwn ? "text-blue-200" : "text-gray-400"}`}
                              >
                                {new Date(msg.createdAt).toLocaleTimeString(
                                  [],
                                  { hour: "2-digit", minute: "2-digit" },
                                )}
                              </span>
                            </div>
                          </div>
                        </div>

                        {msg.isOwn && !isMobile && (
                          <img
                            src={currentUser?.avatar || assets.profile}
                            className="w-8 h-8 rounded-full mt-1 object-cover"
                            alt={currentUser?.username}
                          />
                        )}
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {replyTo && (
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-700 border-t border-gray-600">
                  <Reply size={16} className="text-gray-400 shrink-0" />
                  <div className="flex-1 text-sm text-gray-300 truncate">
                    <span className="font-semibold text-white">
                      {replyTo.senderUsername}
                    </span>
                    <span className="ml-2 text-gray-400">
                      {replyTo.content}
                    </span>
                  </div>
                  <button
                    onClick={() => setReplyTo(null)}
                    className="text-gray-400 hover:text-white p-1"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              {selectedConversation.isBlocked ? (
                <div className="flex items-center justify-center px-4 py-3 border-t border-neutral-800">
                  <div className="flex items-center gap-2 text-neutral-500 text-sm">
                    <Ban className="w-4 h-4 shrink-0" />
                    <span>You can't reply to this conversation</span>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <div className="flex items-center pt-2">
                    <div className="flex-1 -px-2">
                      <MessageInput
                        ref={messageInputRef}
                        key={inputResetKey}
                        mode="MESSAGE"
                        conversationId={selectedConversation.id}
                        onSend={async (message, files, mentions) => {
                          if (editingId) {
                            await updateMessage(editingId, message, mentions);
                            setEditingId(null);
                          } else if (selectedConversation.type === "BOT") {
                            await askBot(message);
                            setReplyTo(null);
                          } else {
                            await sendMessage(
                              message,
                              files,
                              replyTo?.id,
                              mentions,
                            );
                            setReplyTo(null);
                          }
                        }}
                      />
                    </div>
                    {selectedConversation.type !== "BOT" && (
                      <button
                        onClick={async () => {
                          const content = messageInputRef.current?.getText();
                          if (content) {
                            setIsAskingBot(true);
                            messageInputRef.current?.clearText();
                            try {
                              await askBot(content);
                            } finally {
                              setIsAskingBot(false);
                            }
                          }
                        }}
                        disabled={isAskingBot}
                        className="flex items-center cursor-pointer px-4 mr-2 py-2 rounded-md bg-zinc-900 border-gray-600 hover:bg-zinc-700 border transition-all text-sm text-gray-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isAskingBot ? (
                          <CircularProgress
                            size={18}
                            sx={{ color: "#a1a1aa" }}
                          />
                        ) : (
                          <BotMessageSquare />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            <DetailConversation
              open={isOpenDetail}
              onClose={() => setIsOpenDetail(false)}
            />
          </div>
        ) : (
          !loading && (
            <div className="h-full flex-1 flex items-center justify-center text-gray-500">
              Select a user to start messaging
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default MessagePage;
