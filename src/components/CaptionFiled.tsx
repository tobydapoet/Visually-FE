import {
  Popper,
  Paper,
  MenuItem,
  ListItemText,
  Avatar,
  CircularProgress,
} from "@mui/material";
import { Smile } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import useDebounce from "../hooks/useDebounce";
import type { UserSummaryType } from "../types/api/user.type";
import { handleSearchUser } from "../api/user.api";
import type { MentionItem } from "../types/api/mention.type";
import { useCaptionContent } from "../hooks/useCaptionContent";
import { useCaptionPaste } from "../hooks/useCaptionPaste";
import { useEmojiPicker } from "../hooks/useEmojiPicker";
import { useMentionSelection } from "../hooks/useMentionSelection";
import { useMentionKeyboard } from "../hooks/useMentionKeyboard";
import { createLinkChip, insertNodeAtCursor } from "../utils/CaptionUtils";
import EmojiPicker from "emoji-picker-react";
import assets from "../assets";

type Props = {
  value?: string;
  onChange: (value: string) => void;
  onMentionsExtracted?: (mentions: MentionItem[]) => void;
  captionRef?: React.MutableRefObject<HTMLDivElement | null>;
};

export const CaptionField: React.FC<Props> = ({
  onChange,
  onMentionsExtracted,
  captionRef,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [searchResults, setSearchResults] = useState<UserSummaryType[]>([]);
  const [mentionKeyword, setMentionKeyword] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [charCount, setCharCount] = useState(0);

  const debouncedKeyword = useDebounce(mentionKeyword, 400);
  const { extractContent } = useCaptionContent();

  const handleInput = () => {
    const { plainText, mentions } = extractContent(editorRef.current);
    onChange(plainText);
    onMentionsExtracted?.(mentions);
    setCharCount(plainText.length);

    const sel = window.getSelection();
    if (!sel?.rangeCount) return;
    const range = sel.getRangeAt(0);
    const node = range.startContainer;
    if (node.nodeType !== Node.TEXT_NODE) return;

    const textBefore = node.textContent?.slice(0, range.startOffset) ?? "";
    const match = textBefore.match(/@(\w*)$/);

    if (match) {
      setMentionKeyword(match[1]);
      setActiveIndex(0);
    } else {
      setMentionKeyword("");
      setOpen(false);
      setSearchResults([]);
    }
  };

  const clearMentionState = () => {
    setOpen(false);
    setMentionKeyword("");
    setSearchResults([]);
  };

  const { handleSelectUser } = useMentionSelection(
    handleInput,
    () => setOpen(false),
    clearMentionState,
  );

  const { handleKeyDown } = useMentionKeyboard({
    open,
    searchResultsLength: searchResults.length,
    activeIndex,
    setActiveIndex,
    onSelectUser: () => handleSelectUser(searchResults[activeIndex]),
    onClose: () => setOpen(false),
  });

  const handleInsertLink = (url: string) => {
    const chip = createLinkChip(url);
    const space = insertNodeAtCursor(chip, true);

    if (space && space.nextSibling) {
      const newRange = document.createRange();
      newRange.setStartAfter(space);
      newRange.collapse(true);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(newRange);
    }
  };

  const { handlePaste } = useCaptionPaste(handleInsertLink, handleInput);

  const handleInsertEmoji = (emoji: string) => {
    editorRef.current?.focus();
    const sel = window.getSelection();
    if (sel?.rangeCount) {
      const range = sel.getRangeAt(0);
      range.deleteContents();
      range.insertNode(document.createTextNode(emoji));
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
    }
    handleInput();
  };

  const {
    showEmojiPicker,
    emojiPickerRef,
    handleEmojiClick,
    toggleEmojiPicker,
  } = useEmojiPicker(handleInsertEmoji);

  useEffect(() => {
    if (captionRef && editorRef.current) {
      captionRef.current = editorRef.current;
    }
  }, [captionRef]);

  useEffect(() => {
    const fetchUser = async () => {
      if (!debouncedKeyword.trim()) {
        setSearchResults([]);
        setOpen(false);
        return;
      }
      setLoading(true);
      try {
        const res = await handleSearchUser(debouncedKeyword, 0, 5);
        setSearchResults(res.content);
        setOpen(res.content.length > 0);
      } catch {
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [debouncedKeyword]);

  return (
    <div>
      <div className="relative">
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
          onFocus={() => searchResults.length > 0 && setOpen(true)}
          data-placeholder="Write a caption..."
          className="w-full min-h-27 bg-zinc-800 text-white border border-zinc-700
                     rounded-lg px-3 py-2 text-sm leading-relaxed outline-none
                     focus:border-blue-500 transition-colors duration-200
                     empty:before:content-[attr(data-placeholder)]
                     empty:before:text-zinc-500 empty:before:pointer-events-none"
          style={{ maxHeight: "160px", overflowY: "auto" }}
        />

        {showEmojiPicker && (
          <div
            ref={emojiPickerRef}
            className="absolute z-50 bottom-full mb-2 left-0"
          >
            <EmojiPicker
              onEmojiClick={handleEmojiClick}
              theme={"dark" as any}
              height={300}
              width={300}
              searchDisabled
              skinTonesDisabled
              previewConfig={{ showPreview: false }}
            />
          </div>
        )}

        <Popper
          open={open && searchResults.length > 0}
          anchorEl={editorRef.current}
          placement="bottom-start"
          style={{ width: editorRef.current?.clientWidth, zIndex: 1300 }}
          modifiers={[{ name: "offset", options: { offset: [0, 4] } }]}
        >
          <Paper
            sx={{
              maxHeight: 200,
              overflow: "auto",
              backgroundColor: "#27272a",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            }}
          >
            {loading && (
              <div className="flex justify-center py-3">
                <CircularProgress size={20} sx={{ color: "#a1a1aa" }} />
              </div>
            )}
            {!loading &&
              searchResults.map((user, index) => (
                <MenuItem
                  key={user.id}
                  selected={index === activeIndex}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelectUser(user);
                  }}
                  sx={{
                    color: "white",
                    "&:hover": { backgroundColor: "#3f3f46" },
                    "&.Mui-selected": { backgroundColor: "#3f3f46" },
                  }}
                >
                  <Avatar
                    src={user.avatar || assets.profile}
                    sx={{ width: 32, height: 32, mr: 1.5 }}
                  />
                  <ListItemText
                    primary={user.username}
                    secondary={user.fullName}
                    secondaryTypographyProps={{
                      sx: { color: "#a1a1aa", fontSize: "0.75rem" },
                    }}
                  />
                </MenuItem>
              ))}
          </Paper>
        </Popper>
      </div>

      <div className="flex justify-between mt-3">
        <button
          type="button"
          onClick={toggleEmojiPicker}
          className="text-zinc-400 cursor-pointer hover:text-yellow-400 transition-colors duration-200"
        >
          <Smile size={18} />
        </button>
        <div className="text-[12px] text-gray-500">{charCount}/2000</div>
      </div>
    </div>
  );
};
