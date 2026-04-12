import type React from "react";
import SideBarMessage from "../components/SideBarMessage";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import assets from "../assets";
import { CircularProgress } from "@mui/material";
import MessageInput, { type MessageInputRef } from "../components/MessageInput";
import { useMessage } from "../contexts/message.context";
import { useUser } from "../contexts/user.context";
import { EllipsisVertical, Eraser, Pencil, Reply, X } from "lucide-react";
import DetailConversation from "./DetailConversation";
import type { Message } from "../types/api/message.type";
import { ParsedContent } from "../components/ParseContent";

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
  } = useMessage();
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const isLoadingMore = useRef(false);
  const prevScrollHeight = useRef(0);
  const [isOpenDetail, setIsOpenDetail] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const messageInputRef = useRef<MessageInputRef>(null);

  useEffect(() => {
    if (id && currentUser) {
      loadConversationById(Number(id)).then(() => {
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "instant" });
        }, 0);
      });
    }
  }, [id, currentUser]);

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

  return (
    <div className="w-[calc(100vw-4.5rem)] flex">
      <SideBarMessage />
      <div className="flex-1">
        {loading && (
          <div className="h-screen flex items-center justify-center">
            <CircularProgress size={40} sx={{ color: "#a1a1aa" }} />
          </div>
        )}
        {!loading && selectedConversation ? (
          <div className="h-screen flex overflow-hidden">
            <div
              className={`flex flex-col transition-all duration-300 ease-out min-w-0
                ${isOpenDetail ? "flex-1" : "flex-1"}  
              `}
            >
              <div className="w-full flex justify-between border-b border-gray-600 p-4">
                <div className="flex items-center gap-2">
                  {selectedConversation.otherUsers.length > 1 ? (
                    <div className="flex">
                      {selectedConversation.type === "GROUP" ? (
                        selectedConversation.mediaUrl ? (
                          <img
                            src={selectedConversation.mediaUrl}
                            className="w-10 h-10 rounded-full object-cover"
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
                                  className="w-8 h-8 rounded-full object-cover border-2 border-white"
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
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      )}
                    </div>
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
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  )}
                  <div className="font-bold">
                    {selectedConversation.name ||
                      selectedConversation.otherUsers[0].username}
                  </div>
                </div>
                <button
                  className="cursor-pointer"
                  onClick={() => setIsOpenDetail((prev) => !prev)}
                >
                  <EllipsisVertical />
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
                        {!msg.isOwn && (
                          <img
                            src={msg.senderAvatar || assets.profile}
                            className="w-8 h-8 rounded-full object-cover my-auto"
                          />
                        )}

                        <div
                          className={`flex flex-col max-w-[70%] ${msg.isOwn ? "items-end" : "items-start"}`}
                        >
                          {!msg.isOwn && (
                            <span className="text-xs text-gray-400 mb-1 ml-1">
                              {msg.senderUsername}
                            </span>
                          )}

                          <div className="group relative flex">
                            {!msg.isOwn && (
                              <div className="opacity-0 ml-2 flex order-1 justify-center items-center group-hover:opacity-100 transition-all duration-200 mr-1">
                                <button
                                  onClick={() => setReplyTo(msg)}
                                  className="p-2 rounded-full hover:bg-gray-600 transition-all duration-200 cursor-pointer"
                                  title="Reply"
                                >
                                  <Reply size={18} className="text-gray-300" />
                                </button>
                              </div>
                            )}

                            {msg.isOwn && (
                              <div
                                className="mr-2
                                opacity-0 group-hover:opacity-100 
                                transition-all duration-200
                                flex gap-2 items-center"
                              >
                                <button
                                  onClick={() => setReplyTo(msg)}
                                  title="Reply"
                                  className="p-2 rounded-full hover:bg-gray-600 transition-all duration-200 cursor-pointer"
                                >
                                  <Reply size={18} className="text-gray-300" />
                                </button>

                                <button
                                  onClick={() => {
                                    // setEditingId(msg.id);
                                    // setEditingContent(msg.content);
                                    setEditingId(msg.id);
                                    messageInputRef.current?.setText(
                                      msg.content,
                                      msg.mentions,
                                    );
                                  }}
                                  className="p-2 rounded-full hover:bg-blue-500 
                                  transition-all duration-200 cursor-pointer transform hover:scale-110
                                  shadow-lg group/edit"
                                  title="Edit message"
                                >
                                  <Pencil
                                    size={18}
                                    className="text-gray-300 group-hover/edit:text-white"
                                  />
                                </button>

                                <button
                                  onClick={() => deleteMessage(msg.id)}
                                  className="p-2 rounded-full cursor-pointer hover:bg-red-500 
                                  transition-all duration-200 transform hover:scale-110
                                  shadow-lg group/delete"
                                  title="Delete message"
                                >
                                  <Eraser
                                    size={18}
                                    className="text-gray-300 group-hover/delete:text-white"
                                  />
                                </button>
                              </div>
                            )}

                            <div
                              className={`rounded-lg p-3 ${
                                msg.isOwn
                                  ? "bg-blue-600 text-white"
                                  : "bg-gray-700 text-gray-100"
                              }`}
                            >
                              {(msg.files?.length > 0 ||
                                msg.filePreviews?.length > 0) && (
                                <div className="flex flex-wrap gap-2 mb-2">
                                  {msg.filePreviews.map((preview, index) => (
                                    <img
                                      key={index}
                                      src={preview}
                                      alt={`media-${index}`}
                                      className="max-w-50 max-h-50 rounded-lg object-cover"
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
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  },
                                )}
                              </span>
                            </div>
                          </div>
                        </div>

                        {msg.isOwn && (
                          <img
                            src={currentUser?.avatar || assets.profile}
                            className="w-8 h-8 rounded-full mt-1 object-cover flex"
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
                    className="text-gray-400 hover:text-white"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              <MessageInput
                ref={messageInputRef}
                key={inputResetKey}
                mode="MESSAGE"
                conversationId={selectedConversation.id}
                onSend={async (message, files, mentions) => {
                  if (editingId) {
                    await updateMessage(editingId, message, mentions);
                    setEditingId(null);
                  } else {
                    await sendMessage(message, files, replyTo?.id, mentions);
                    setReplyTo(null);
                  }
                }}
              />
            </div>
            <DetailConversation
              open={isOpenDetail}
              onClose={() => setIsOpenDetail(false)}
            />
          </div>
        ) : (
          !loading && (
            <div className="h-screen flex items-center justify-center text-gray-500">
              Select a user to start messaging
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default MessagePage;
