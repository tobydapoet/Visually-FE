import { useState, useEffect } from "react";
import useDebounce from "./useDebounce";
import type { UserSummaryType } from "../types/api/user.type";
import { handleSearchUser } from "../api/user.api";
import { createMentionChip } from "../utils/CaptionUtils";

export function useStoryMention() {
  const [mentionKeyword, setMentionKeyword] = useState("");
  const [mentionResults, setMentionResults] = useState<UserSummaryType[]>([]);
  const [showMentionPopup, setShowMentionPopup] = useState(false);
  const [activeMentionIndex, setActiveMentionIndex] = useState(0);
  const [loadingMentions, setLoadingMentions] = useState(false);

  const debouncedKeyword = useDebounce(mentionKeyword, 400);

  useEffect(() => {
    if (!debouncedKeyword.trim()) {
      setMentionResults([]);
      setShowMentionPopup(false);
      return;
    }
    setLoadingMentions(true);
    handleSearchUser(debouncedKeyword, 0, 5)
      .then((res) => {
        setMentionResults(res.content);
        setShowMentionPopup(res.content.length > 0);
      })
      .catch(() => setMentionResults([]))
      .finally(() => setLoadingMentions(false));
  }, [debouncedKeyword]);

  const detectMentionTrigger = (rangeNode: Node, offset: number) => {
    const textBefore = rangeNode.textContent?.slice(0, offset) ?? "";
    const match = textBefore.match(/@(\w*)$/);
    if (match) {
      setMentionKeyword(match[1]);
      setActiveMentionIndex(0);
    } else {
      setMentionKeyword("");
      setShowMentionPopup(false);
      setMentionResults([]);
    }
  };

  const selectMention = (user: UserSummaryType) => {
    const sel = window.getSelection();
    if (!sel?.rangeCount) return;

    const range = sel.getRangeAt(0);
    const node = range.startContainer;
    if (node.nodeType !== Node.TEXT_NODE) return;

    const textBeforeCursor =
      node.textContent?.slice(0, range.startOffset) ?? "";

    const atIndex = textBeforeCursor.lastIndexOf("@");
    if (atIndex === -1) return;

    const deleteRange = document.createRange();
    deleteRange.setStart(node, atIndex);
    deleteRange.setEnd(node, range.startOffset);
    deleteRange.deleteContents();

    const chip = createMentionChip(user.username, user.id);

    deleteRange.insertNode(document.createTextNode(" "));
    deleteRange.insertNode(chip);

    const space = chip.nextSibling;
    const newRange = document.createRange();
    newRange.setStartAfter(space || chip);
    newRange.collapse(true);
    sel.removeAllRanges();
    sel.addRange(newRange);

    const editor = node.parentElement?.closest('[contenteditable="true"]');
    if (editor) {
      const event = new Event("input", { bubbles: true });
      editor.dispatchEvent(event);
    }

    setShowMentionPopup(false);
    setMentionKeyword("");
    setMentionResults([]);
  };

  const reset = () => {
    setMentionKeyword("");
    setMentionResults([]);
    setShowMentionPopup(false);
  };

  return {
    mentionKeyword,
    mentionResults,
    showMentionPopup,
    activeMentionIndex,
    setActiveMentionIndex,
    loadingMentions,
    detectMentionTrigger,
    selectMention,
    reset,
  };
}
