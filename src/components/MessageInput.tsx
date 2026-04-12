import {
  useRef,
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  Paperclip,
  Smile,
  SendHorizontal,
  X,
  Pencil,
  Reply,
} from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import { useMultiFileUpload } from "../hooks/useMultifileUpload";
import { CircularProgress } from "@mui/material";
import { handleSeachMember } from "../api/message.api";
import { handleSearchUser } from "../api/user.api";
import assets from "../assets";
import type { MentionItem } from "../types/api/mention.type";
import type { UserSummaryType } from "../types/api/user.type";
import type { MemberType } from "../types/api/message.type";
import useDebounce from "../hooks/useDebounce";

type Props =
  | {
      mode: "MESSAGE";
      conversationId: number;
      onSend: (
        message: string,
        files: File[],
        mentions?: MentionItem[],
      ) => Promise<void>;
      onReset?: () => void;
      placeholder?: string;
    }
  | {
      mode?: "COMMENT";
      onCancelEdit?: () => void;
      onSend: (message: string, mentions?: MentionItem[]) => Promise<void>;
      onReset?: () => void;
      placeholder?: string;
      replyingTo?: string | null;
      onCancelReply?: () => void;
    };

export type MessageInputRef = {
  setText: (text: string, mentions?: MentionItem[], isEdit?: boolean) => void;
  clearText: () => void;
  setReplyingTo: (username: string | null) => void;
};

const MessageInput = forwardRef<MessageInputRef, Props>((props, ref) => {
  const { onSend, onReset, mode = "MESSAGE" } = props;
  const [isEditing, setIsEditing] = useState(false);

  const [messageValue, setMessageValue] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionResults, setMentionResults] = useState<any[]>([]);
  const [mentionIndex, setMentionIndex] = useState(0);
  const [replyingToUsername, setReplyingToUsername] = useState<string | null>(
    null,
  );
  const [mentions, setMentions] = useState<MentionItem[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  const debouncedMentionQuery = useDebounce(mentionQuery, 300);

  const {
    entries,
    inputRef: fileInputRef,
    handleChange: handleFileChange,
    handleDrop,
    handleRemove,
    handleRemoveAll,
  } = useMultiFileUpload({
    accept: "image/*,video/*,application/pdf,.doc,.docx,.txt",
    maxFiles: 10,
    maxSizeMB: 50,
    maxVideoDurationSec: 60,
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (onReset) {
      setMessageValue("");
      handleRemoveAll();
      if (textareaRef.current) textareaRef.current.style.height = "auto";
    }
  }, [onReset]);

  useEffect(() => {
    setMentionIndex(0);
  }, [mentionResults]);

  useImperativeHandle(ref, () => ({
    setText: (text: string, mentions?: MentionItem[], isEdit = false) => {
      setMessageValue(text);
      setMentions(mentions ?? []);
      setIsEditing(isEdit);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.style.height = "auto";
          textareaRef.current.style.height =
            Math.min(textareaRef.current.scrollHeight, 120) + "px";
        }
      }, 0);
    },

    setReplyingTo: (username: string | null) => {
      setReplyingToUsername(username);
    },
    clearText: () => {
      setMessageValue("");
      setMentions([]);
      setIsEditing(false);
      setReplyingToUsername(null);
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    },
  }));

  const handleSend = async () => {
    if (!messageValue.trim() && mode === "MESSAGE" && entries.length === 0)
      return;

    setIsSending(true);
    try {
      if (mode === "MESSAGE") {
        await (
          onSend as (
            message: string,
            files: File[],
            mentions?: MentionItem[],
          ) => Promise<void>
        )(
          messageValue,
          entries.map((e) => e.file),
          mentions,
        );
      } else {
        await (
          onSend as (message: string, mentions?: MentionItem[]) => Promise<void>
        )(messageValue, mentions);
      }
      setMessageValue("");
      setMentions([]);
      setIsEditing(false);
      handleRemoveAll();
      if (textareaRef.current) textareaRef.current.style.height = "auto";
    } finally {
      setIsSending(false);
    }
  };

  const handleEmojiClick = (emojiObject: any) => {
    setMessageValue((prev) => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
    textareaRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (mentionResults.length > 0 && mentionQuery !== null) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setMentionIndex((prev) => (prev + 1) % mentionResults.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setMentionIndex(
          (prev) => (prev - 1 + mentionResults.length) % mentionResults.length,
        );
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        handleSelectMention(mentionResults[mentionIndex]);
        return;
      }
      if (e.key === "Escape") {
        setMentionQuery(null);
        setMentionResults([]);
        return;
      }
    }

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessageValue(value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";

    setMentions((prev) => prev.filter((m) => value.includes(`@${m.username}`)));

    const cursor = e.target.selectionStart;
    const textBeforeCursor = value.slice(0, cursor);
    const match = textBeforeCursor.match(/@([a-zA-Z0-9_.]*)$/);

    if (match) {
      setMentionQuery(match[1]);
    } else {
      setMentionQuery(null);
      setMentionResults([]);
    }
  };

  useEffect(() => {
    if (debouncedMentionQuery === null) return;

    const search = async () => {
      if (mode === "MESSAGE" && "conversationId" in props) {
        const res = await handleSeachMember(
          props.conversationId,
          debouncedMentionQuery,
        );
        setMentionResults(
          res.map((u: MemberType) => ({
            userId: u.userId,
            username: u.username,
            avatarUrl: u.avatarUrl,
          })),
        );
      } else {
        const res = await handleSearchUser(
          debouncedMentionQuery ?? "",
          0,
          5,
          true,
        );
        setMentionResults(
          res.content.map((u: UserSummaryType) => ({
            userId: u.id,
            username: u.username,
            avatar: u.avatar,
          })),
        );
      }
    };

    search();
  }, [debouncedMentionQuery]);
  const handleSelectMention = (user: { userId: string; username: string }) => {
    const cursor = textareaRef.current?.selectionStart || 0;
    const textBeforeCursor = messageValue.slice(0, cursor);
    const textAfterCursor = messageValue.slice(cursor);
    const replaced = textBeforeCursor.replace(/@(\w*)$/, `@${user.username} `);

    setMessageValue(replaced + textAfterCursor);
    setMentions((prev) => [...prev, user]);
    setMentionQuery(null);
    setMentionResults([]);
    textareaRef.current?.focus();
  };

  const canSend = messageValue.trim().length > 0 || entries.length > 0;

  return (
    <div className="px-4 py-3">
      {isEditing && (
        <div className="flex items-center justify-between gap-2 px-3 py-1.5 mb-1 bg-blue-900/40 border border-blue-500/50 rounded-lg text-xs text-blue-300">
          <div className="flex items-center gap-2">
            <Pencil size={12} />
            <span>Editing message</span>
          </div>
          <button
            onClick={() => {
              setIsEditing(false);
              setMessageValue("");
              setMentions([]);
            }}
            className="hover:text-white transition-colors"
          >
            <X size={12} />
          </button>
        </div>
      )}

      {replyingToUsername && (
        <div className="flex items-center justify-between gap-2 px-3 py-1.5 mb-1 bg-gray-700/60 border border-gray-500/50 rounded-lg text-xs text-gray-300">
          <div className="flex items-center gap-2">
            <Reply size={12} />
            <span>
              Replying to{" "}
              <span className="text-white font-semibold">
                @{replyingToUsername}
              </span>
            </span>
          </div>
          <button
            onClick={() => {
              setReplyingToUsername(null);
              setMessageValue("");
              setMentions([]);
            }}
            className="hover:text-white transition-colors"
          >
            <X size={12} />
          </button>
        </div>
      )}

      {mode === "MESSAGE" && (
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*,application/pdf,.doc,.docx,.txt"
          onChange={handleFileChange}
          className="hidden"
        />
      )}

      <div className="relative">
        {mentionResults.length > 0 && mentionQuery !== null && (
          <div className="absolute bottom-full mb-2 left-0 w-64 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-50 overflow-hidden">
            {mentionResults.map((user, index) => (
              <button
                key={user.userId}
                onClick={() => handleSelectMention(user)}
                className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-700 transition-colors text-left ${
                  index === mentionIndex ? "bg-gray-700" : ""
                }`}
              >
                <img
                  src={user.avatarUrl || user.avatar || assets.profile}
                  className="w-7 h-7 rounded-full object-cover"
                />
                <span className="text-sm text-white">{user.username}</span>
              </button>
            ))}
          </div>
        )}
        {mode === "MESSAGE" && entries.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2 p-2 rounded-lg border border-gray-600 bg-gray-800/50">
            {entries.map((entry) => (
              <div key={entry.id} className="relative group">
                {entry.file.type.startsWith("image/") ? (
                  <img
                    src={entry.preview}
                    alt={entry.file.name}
                    className="w-16 h-16 object-cover rounded-lg border border-gray-600"
                  />
                ) : (
                  <div className="w-16 h-16 flex flex-col items-center justify-center rounded-lg border border-gray-600 bg-gray-700 px-1">
                    <span className="text-xs font-bold text-blue-400 uppercase">
                      {entry.file.name.split(".").pop()}
                    </span>
                    <span className="text-[10px] text-gray-400 text-center mt-1 leading-tight break-all">
                      {entry.file.name.length > 12
                        ? entry.file.name.slice(0, 10) + "…"
                        : entry.file.name}
                    </span>
                  </div>
                )}
                <button
                  onClick={() => handleRemove(entry.id)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gray-900 border border-gray-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={10} className="text-white" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div
          className="flex items-end rounded-lg border border-gray-600 focus-within:border-blue-500 transition-colors"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 cursor-pointer rounded-l-lg transition-colors"
            aria-label="Pick emoji"
          >
            <Smile size={22} color="#4b5563" />
          </button>

          {showEmojiPicker && (
            <div
              ref={emojiPickerRef}
              className="absolute bottom-full mb-2 left-0 z-50"
            >
              <EmojiPicker
                onEmojiClick={handleEmojiClick}
                autoFocusSearch={false}
                theme={"dark" as any}
              />
            </div>
          )}

          {mode === "MESSAGE" && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 cursor-pointer transition-colors"
              aria-label="Attach file"
            >
              <Paperclip size={22} color="#4b5563" />
            </button>
          )}

          <textarea
            ref={textareaRef}
            value={messageValue}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyPress}
            placeholder="Message..."
            disabled={isSending}
            className="flex-1 bg-transparent text-white placeholder-gray-400 py-2 px-1 outline-none resize-none min-h-10 max-h-32 disabled:opacity-50"
            rows={1}
          />

          <button
            onClick={handleSend}
            disabled={!canSend || isSending}
            className={`p-2 rounded-r-lg transition-colors ${
              canSend && !isSending ? "cursor-pointer" : "cursor-not-allowed"
            }`}
          >
            {isSending ? (
              <CircularProgress size={18} sx={{ color: "#2563eb" }} />
            ) : (
              <SendHorizontal color={canSend ? "#2563eb" : "#4b5563"} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
});

export default MessageInput;
