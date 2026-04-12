import React, { useState, useEffect } from "react";
import {
  TextField,
  InputAdornment,
  IconButton,
  CircularProgress,
  Box,
  Paper,
  useTheme,
  alpha,
} from "@mui/material";
import { Search, X } from "lucide-react";

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onSearch: () => void;
  isLoading: boolean;
  autoFocus?: boolean;
  placeholder?: string;
  fullWidth?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
  searchTerm,
  onSearchChange,
  onSearch,
  isLoading,
  autoFocus = false,
  placeholder = "Search by title or artist...",
  fullWidth = true,
}) => {
  const theme = useTheme();
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

  useEffect(() => {
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onSearch();
    }
  };

  const handleClear = () => {
    setLocalSearchTerm("");
    onSearchChange("");
    onSearch();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalSearchTerm(value);
    onSearchChange(value);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: "2px 4px",
        display: "flex",
        alignItems: "center",
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        transition: "all 0.2s ease",
        "&:hover": {
          borderColor: theme.palette.primary.main,
          boxShadow: `0 0 0 1px ${alpha(theme.palette.primary.main, 0.2)}`,
        },
        "&:focus-within": {
          borderColor: theme.palette.primary.main,
          boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
        },
      }}
    >
      <TextField
        variant="standard"
        placeholder={placeholder}
        value={localSearchTerm}
        onChange={handleChange}
        onKeyPress={handleKeyPress}
        autoFocus={autoFocus}
        fullWidth={fullWidth}
        InputProps={{
          disableUnderline: true,
          startAdornment: (
            <InputAdornment position="start">
              <Search
                size={20}
                style={{ color: theme.palette.text.secondary, marginLeft: 4 }}
              />
            </InputAdornment>
          ),
          endAdornment: (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              {localSearchTerm && (
                <IconButton
                  size="small"
                  onClick={handleClear}
                  sx={{ p: 0.5 }}
                  aria-label="clear search"
                >
                  <X
                    size={16}
                    style={{ color: theme.palette.text.secondary }}
                  />
                </IconButton>
              )}
              {isLoading && <CircularProgress size={20} sx={{ mx: 0.5 }} />}
            </Box>
          ),
          sx: {
            py: 1.5,
            px: 1,
            "& .MuiInputBase-input": {
              py: 0.5,
              fontSize: "0.875rem",
            },
          },
        }}
        sx={{
          flex: 1,
          "& .MuiInputBase-root": {
            "&:before": {
              display: "none",
            },
            "&:after": {
              display: "none",
            },
          },
        }}
      />
      <IconButton
        onClick={onSearch}
        disabled={isLoading}
        sx={{
          mx: 1,
          bgcolor: "primary.main",
          color: "white",
          borderRadius: 1.5,
          "&:hover": {
            bgcolor: "primary.dark",
          },
          "&.Mui-disabled": {
            bgcolor: "action.disabledBackground",
            color: "action.disabled",
          },
        }}
        aria-label="search"
      >
        {isLoading ? (
          <CircularProgress size={20} color="inherit" />
        ) : (
          <Search size={20} />
        )}
      </IconButton>
    </Paper>
  );
};

export default SearchBar;
