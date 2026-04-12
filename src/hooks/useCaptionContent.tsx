import { useCallback } from "react";
import type { MentionItem } from "../types/api/mention.type";

export const useCaptionContent = () => {
  const extractContent = useCallback((editor: HTMLDivElement | null) => {
    if (!editor) return { plainText: "", mentions: [] as MentionItem[] };

    let plainText = "";
    const mentions: MentionItem[] = [];

    editor.childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        plainText += node.textContent ?? "";
      } else if (node instanceof HTMLElement && node.dataset.id) {
        const username = node.dataset.username ?? "";
        plainText += `@${username}`;
        mentions.push({
          userId: node.dataset.id,
          username,
        });
      } else if (node instanceof HTMLElement && node.dataset.url) {
        plainText += node.dataset.url;
      } else {
        plainText += node.textContent ?? "";
      }
    });

    return { plainText, mentions };
  }, []);

  return { extractContent };
};
