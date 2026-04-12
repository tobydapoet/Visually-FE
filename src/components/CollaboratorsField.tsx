import {
  TextField,
  Chip,
  Box,
  CircularProgress,
  Popper,
  Paper,
  MenuItem,
  ListItemText,
  Avatar,
} from "@mui/material";
import type React from "react";
import { useEffect, useState, useRef } from "react";
import useDebounce from "../hooks/useDebounce";
import { handleSearchRelationship } from "../api/follow.api";
import type { FollowType } from "../types/api/follow.type";
import { ContactRound } from "lucide-react";
import assets from "../assets";

type SelectedUser = {
  id: string;
  username: string;
  avatar: string;
};

type Props = {
  value: string[];
  onChange: (value: string[]) => void;
};

export const CollaboratorsField: React.FC<Props> = ({
  value = [],
  onChange,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [searchResults, setSearchResults] = useState<FollowType[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<SelectedUser[]>([]);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchFollow = async () => {
      if (!debouncedSearch.trim()) {
        setSearchResults([]);
        setOpen(false);
        return;
      }
      setLoading(true);
      try {
        const res = await handleSearchRelationship(debouncedSearch);
        setSearchResults(res.content);
        setOpen(res.totalElements > 0);
      } catch (error) {
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFollow();
  }, [debouncedSearch]);

  const handleAddCollaborator = (result: FollowType) => {
    const userId = result.user.id;
    if (!userId || value.includes(userId)) return;

    onChange([...value, userId]);
    setSelectedUsers((prev) => [
      ...prev,
      {
        id: userId,
        username: result.user.username,
        avatar: result.user.avatar,
      },
    ]);
    setInputValue("");
    setSearch("");
    setSearchResults([]);
    setOpen(false);
  };

  const handleRemove = (userId: string) => {
    onChange(value.filter((id) => id !== userId));
    setSelectedUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && inputValue.trim() && !loading) {
      e.preventDefault();
      if (searchResults.length > 0) {
        handleAddCollaborator(searchResults[0]);
      }
    }
  };

  return (
    <Box sx={{ position: "relative", marginTop: "1rem" }}>
      <TextField
        inputRef={inputRef}
        fullWidth
        size="small"
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          setSearch(e.target.value);
        }}
        onKeyDown={handleKeyDown}
        onFocus={() => searchResults.length > 0 && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 200)}
        placeholder="Add collaborator"
        variant="outlined"
        InputProps={{
          endAdornment: loading ? (
            <CircularProgress size={20} sx={{ color: "#a1a1aa" }} />
          ) : (
            <ContactRound size={25} color="gray" />
          ),
        }}
        sx={{
          "& .MuiOutlinedInput-root": {
            fontFamily: "var(--font-plus)",
            color: "white",
            backgroundColor: "#27272a",
            borderRadius: "8px",
            "& fieldset": { borderColor: "#3f3f46" },
            "&:hover fieldset": { borderColor: "#52525b" },
            "&.Mui-focused fieldset": {
              borderColor: "#3b82f6",
            },
          },
          "& .MuiInputBase-input": {
            fontFamily: "var(--font-plus)",
            "& .MuiOutlinedInput-input": {
              "&::placeholder": {
                color: "#71717a",
                opacity: 1,
              },
            },
          },
          "& .MuiInputBase-input::placeholder": {
            fontFamily: "var(--font-plus)",
            fontWeight: 400,
            color: "#a1a1aa",
            opacity: 1,
            fontSize: "0.875rem",
          },
        }}
      />

      <Popper
        open={open && searchResults.length > 0}
        anchorEl={inputRef.current}
        placement="bottom-start"
        style={{ width: inputRef.current?.clientWidth, zIndex: 1300 }}
        modifiers={[{ name: "offset", options: { offset: [0, 4] } }]}
      >
        <Paper
          sx={{
            maxHeight: 200,
            overflow: "auto",
            backgroundColor: "#27272a",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          }}
        >
          {searchResults
            .filter((result) => !value.includes(result.user.id))
            .map((result) => (
              <MenuItem
                key={result.user.id}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleAddCollaborator(result);
                }}
                sx={{
                  color: "white",
                  "&:hover": { backgroundColor: "#3f3f46" },
                }}
              >
                <Avatar
                  src={result.user.avatar}
                  sx={{ width: 32, height: 32, mr: 1.5 }}
                />
                <ListItemText
                  primary={result.user.username}
                  secondary={result.user.fullName}
                  secondaryTypographyProps={{
                    sx: { color: "#a1a1aa", fontSize: "0.75rem" },
                  }}
                />
              </MenuItem>
            ))}
        </Paper>
      </Popper>

      {selectedUsers.length > 0 && (
        <Box className="flex flex-wrap gap-2 mt-3">
          {selectedUsers.map((user) => (
            <Chip
              key={user.id}
              avatar={<Avatar src={user.avatar || assets.profile} />}
              label={user.username}
              onDelete={() => handleRemove(user.id)}
              sx={{
                backgroundColor: "#3f3f46",
                color: "white",
                "& .MuiChip-deleteIcon": {
                  color: "#a1a1aa",
                  "&:hover": { color: "white" },
                },
                "& .MuiAvatar-root": {
                  width: 24,
                  height: 24,
                },
              }}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default CollaboratorsField;
