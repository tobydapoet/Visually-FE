import { useCallback } from "react";

export const useCaptionPaste = (
  onInsert: (text: string) => void,
  handleInput: () => void,
) => {
  const tryInsertLink = useCallback(
    (text: string): boolean => {
      const urlRegex = /^https?:\/\/[^\s]+$/;
      if (!urlRegex.test(text.trim())) return false;

      onInsert(text);
      handleInput();
      return true;
    },
    [onInsert, handleInput],
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLDivElement>) => {
      const text = e.clipboardData.getData("text/plain");
      const urlRegex = /^https?:\/\/[^\s]+$/;
      if (urlRegex.test(text.trim())) {
        e.preventDefault();
        tryInsertLink(text);
      }
    },
    [tryInsertLink],
  );

  return { handlePaste };
};
