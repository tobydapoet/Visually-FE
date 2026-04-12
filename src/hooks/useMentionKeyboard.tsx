import { useCallback } from "react";

type UseMentionKeyboardProps = {
  open: boolean;
  searchResultsLength: number;
  activeIndex: number;
  setActiveIndex: (index: number | ((prev: number) => number)) => void;
  onSelectUser: () => void;
  onClose: () => void;
};

export const useMentionKeyboard = ({
  open,
  searchResultsLength,
  activeIndex,
  setActiveIndex,
  onSelectUser,
  onClose,
}: UseMentionKeyboardProps) => {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (!open || !searchResultsLength) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setActiveIndex((prev) => (prev + 1) % searchResultsLength);
          break;
        case "ArrowUp":
          e.preventDefault();
          setActiveIndex(
            (prev) => (prev - 1 + searchResultsLength) % searchResultsLength,
          );
          break;
        case "Enter":
          e.preventDefault();
          onSelectUser();
          break;
        case "Escape":
          onClose();
          break;
      }
    },
    [open, searchResultsLength, setActiveIndex, onSelectUser, onClose],
  );

  return { handleKeyDown };
};
