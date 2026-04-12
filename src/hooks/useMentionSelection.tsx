import { useCallback } from "react";
import { createMentionChip } from "../utils/CaptionUtils";
import type { UserSummaryType } from "../types/api/user.type";

export const useMentionSelection = (
  onMentionSelected: () => void,
  onClose: () => void,
  onClearKeyword: () => void,
) => {
  const handleSelectUser = useCallback(
    (user: UserSummaryType) => {
      const sel = window.getSelection();
      if (!sel?.rangeCount) return;

      const range = sel.getRangeAt(0);
      const node = range.startContainer;
      if (node.nodeType !== Node.TEXT_NODE) return;

      const textBefore = node.textContent?.slice(0, range.startOffset) ?? "";
      const atIndex = textBefore.lastIndexOf("@");

      const deleteRange = document.createRange();
      deleteRange.setStart(node, atIndex);
      deleteRange.setEnd(node, range.startOffset);
      deleteRange.deleteContents();

      const chip = createMentionChip(user.username, user.id);
      deleteRange.insertNode(document.createTextNode(" "));
      deleteRange.insertNode(chip);

      const space = chip.nextSibling!;
      const newRange = document.createRange();
      newRange.setStartAfter(space);
      newRange.collapse(true);
      sel.removeAllRanges();
      sel.addRange(newRange);

      onClose();
      onClearKeyword();
      onMentionSelected();
    },
    [onMentionSelected, onClose, onClearKeyword],
  );

  return { handleSelectUser };
};
