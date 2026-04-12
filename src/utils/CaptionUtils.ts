export const createMentionChip = (
  username: string,
  userId: string,
): HTMLSpanElement => {
  const chip = document.createElement("span");
  chip.dataset.id = userId;
  chip.dataset.username = username;
  chip.contentEditable = "false";
  chip.textContent = `@${username}`;
  chip.style.cssText =
    "color:#60a5fa;font-weight:500;cursor:default;user-select:none;";
  return chip;
};

export const createLinkChip = (url: string): HTMLSpanElement => {
  const chip = document.createElement("span");
  chip.dataset.url = url;
  chip.contentEditable = "false";
  chip.textContent = url;
  chip.style.cssText =
    "color:#34d399;font-weight:500;cursor:default;user-select:none;background:rgba(52,211,153,0.1);border-radius:4px;padding:0 4px;";
  return chip;
};

export const insertNodeAtCursor = (node: Node, afterNode?: boolean) => {
  const sel = window.getSelection();
  if (!sel?.rangeCount) return null;

  const range = sel.getRangeAt(0);
  range.deleteContents();
  range.insertNode(node);

  if (afterNode) {
    const space = document.createTextNode(" ");
    range.insertNode(space);
    return space;
  }

  return node;
};
