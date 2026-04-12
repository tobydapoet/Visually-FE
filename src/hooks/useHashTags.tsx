import { useState } from "react";

export const useHashtags = () => {
  const [input, setInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  const addTag = () => {
    const tag = input.trim().replace(/^#/, "");
    if (tag && !tags.includes(tag)) {
      setTags((prev) => [...prev, tag]);
    }
    setInput("");
  };

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  return { input, setInput, tags, addTag, removeTag };
};
