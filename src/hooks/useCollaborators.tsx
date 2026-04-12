import { useState } from "react";

export const useCollaborators = () => {
  const [input, setInput] = useState("");
  const [collabIds, setCollabIds] = useState<string[]>([]);

  const addCollab = (id: string) => {
    if (!collabIds.includes(id)) {
      setCollabIds((prev) => [...prev, id]);
    }
    setInput("");
  };

  const removeCollab = (id: string) => {
    setCollabIds((prev) => prev.filter((c) => c !== id));
  };

  return { input, setInput, collabIds, addCollab, removeCollab };
};
