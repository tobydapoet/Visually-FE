import { useState, useRef, useEffect } from "react";
import type { EmojiClickData } from "emoji-picker-react";

export const useEmojiPicker = (onEmojiSelect: (emoji: string) => void) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(e.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    onEmojiSelect(emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const toggleEmojiPicker = () => setShowEmojiPicker((prev) => !prev);

  return {
    showEmojiPicker,
    emojiPickerRef,
    handleEmojiClick,
    toggleEmojiPicker,
  };
};
