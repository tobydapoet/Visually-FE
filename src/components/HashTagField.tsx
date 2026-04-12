import { TextField, Chip, Box } from "@mui/material";
import type React from "react";
import { useState } from "react";
import { Hash } from "lucide-react";

type Props = {
  value: string[];
  onChange: (value: string[]) => void;
};

export const HashTagsField: React.FC<Props> = ({ value = [], onChange }) => {
  const [inputValue, setInputValue] = useState("");

  const handleAdd = () => {
    const tag = inputValue.trim().replace(/^#+/, "");
    if (!tag || value.includes(tag)) return;
    onChange([...value, tag]);
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
    if (e.key === "Backspace" && inputValue === "" && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  return (
    <Box sx={{ position: "relative", marginTop: "1rem" }}>
      <TextField
        fullWidth
        size="small"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Add hashtag, press Enter"
        variant="outlined"
        InputProps={{
          endAdornment: <Hash size={18} color="gray" />,
        }}
        sx={{
          "& .MuiOutlinedInput-root": {
            color: "white",
            backgroundColor: "#27272a",
            borderRadius: "8px",
            "& fieldset": { borderColor: "#3f3f46" },
            "&:hover fieldset": { borderColor: "#52525b" },
            "&.Mui-focused fieldset": { borderColor: "#3b82f6" },
          },
          "& .MuiInputBase-input::placeholder": {
            color: "#a1a1aa",
            opacity: 1,
            fontSize: "0.875rem",
          },
        }}
      />

      {value.length > 0 && (
        <Box className="flex flex-wrap gap-2 mt-3">
          {value.map((tag) => (
            <Chip
              key={tag}
              label={`#${tag}`}
              onDelete={() => onChange(value.filter((t) => t !== tag))}
              sx={{
                backgroundColor: "#3f3f46",
                color: "white",
                fontSize: "0.75rem",
                "& .MuiChip-deleteIcon": {
                  color: "#a1a1aa",
                  "&:hover": { color: "white" },
                },
              }}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default HashTagsField;
