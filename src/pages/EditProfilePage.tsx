import React from "react";
import {
  Box,
  Typography,
  Avatar,
  TextField,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  FormHelperText,
} from "@mui/material";
import {
  User,
  AtSign,
  Calendar,
  Info,
  Mail,
  VenusAndMars,
  Camera,
} from "lucide-react";
import { useUser } from "../contexts/user.context";
import { Gender } from "../constants/gender.enum";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  UserUpdateSchema,
  type UserUpdateType,
} from "../types/schemas/user.schema";
import { handleUpdateUser } from "../api/user.api";
import { toast } from "sonner";
import assets from "../assets";

const EditProfilePage: React.FC = () => {
  const { currentUser, reloadUser } = useUser();
  if (!currentUser) {
    return;
  }

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<UserUpdateType>({
    resolver: zodResolver(UserUpdateSchema),
    mode: "onBlur",
    defaultValues: {
      fullName: currentUser.fullName,
      username: currentUser.username,
      dob: currentUser?.dob
        ? new Date(currentUser.dob).toISOString().split("T")[0]
        : "",
      gender: currentUser.gender as Gender,
    },
  });

  const selectedGender = watch("gender");

  const onSubmit = async (data: UserUpdateType) => {
    const formData = new FormData();
    formData.append("fullName", data.fullName);
    formData.append("username", data.username);
    formData.append("dob", data.dob);
    formData.append("gender", data.gender);
    formData.append("bio", data.bio);
    if (data.file) {
      formData.append("file", data.file);
    }

    const res = await handleUpdateUser(formData);
    if (res.success) {
      toast.success("Update success!");
      reloadUser();
    } else {
      toast.error(res.message);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("file", file);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-6 rounded-2xl mx-auto">
      <div className="flex items-center justify-between mb-6 bg-neutral-800 rounded-2xl py-3 px-5">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Avatar
              src={currentUser?.avatar || assets.profile}
              alt={currentUser.fullName}
              sx={{ width: 80, height: 80, border: "2px solid #333" }}
            />
            <label className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer">
              <Camera size={28} className="text-white" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          </div>
          <div>
            <Typography
              variant="h6"
              fontWeight="bold"
              sx={{ color: "#ffffff" }}
            >
              {currentUser.username}
            </Typography>
            <Typography variant="body2" sx={{ color: "#999" }}>
              {currentUser.fullName}
            </Typography>
          </div>
        </div>

        <label className="bg-blue-600 cursor-pointer hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200">
          <Camera size={16} />
          Change photo
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>
      </div>

      <div className="space-y-4">
        <TextField
          fullWidth
          label="Full Name"
          margin="normal"
          error={!!errors.fullName}
          helperText={errors.fullName?.message}
          {...register("fullName")}
          InputProps={{
            startAdornment: (
              <Box sx={{ mr: 1, display: "flex", alignItems: "center" }}>
                <User size={20} color="#999" />
              </Box>
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              color: "#ffffff",
              "& fieldset": { borderColor: "#333" },
              "&:hover fieldset": { borderColor: "#555" },
              "&.Mui-focused fieldset": { borderColor: "#666" },
            },
            "& .MuiInputLabel-root": { color: "#999" },
            "& .MuiInputLabel-root.Mui-focused": { color: "#ccc" },
            "& .MuiFormHelperText-root": {
              color: "#f44336",
              marginLeft: 0,
            },
          }}
        />

        <TextField
          fullWidth
          label="Username"
          margin="normal"
          error={!!errors.username}
          helperText={
            errors.username?.message || "This will be your unique username"
          }
          {...register("username")}
          InputProps={{
            startAdornment: (
              <Box sx={{ mr: 1, display: "flex", alignItems: "center" }}>
                <AtSign size={20} color="#999" />
              </Box>
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              color: "#ffffff",
              "& fieldset": { borderColor: "#333" },
              "&:hover fieldset": { borderColor: "#555" },
              "&.Mui-focused fieldset": { borderColor: "#666" },
            },
            "& .MuiInputLabel-root": { color: "#999" },
            "& .MuiInputLabel-root.Mui-focused": { color: "#ccc" },
            "& .MuiFormHelperText-root": {
              color: errors.username ? "#f44336" : "#777",
              marginLeft: 0,
            },
          }}
        />

        <div className="grid grid-cols-2 gap-3">
          <FormControl fullWidth margin="normal" error={!!errors.gender}>
            <InputLabel id="gender-label" sx={{ color: "#999" }}>
              Gender
            </InputLabel>
            <Select
              labelId="gender-label"
              label="Gender"
              value={selectedGender || ""}
              {...register("gender")}
              startAdornment={
                <Box sx={{ mr: 1, display: "flex", alignItems: "center" }}>
                  <VenusAndMars size={20} color="#999" />
                </Box>
              }
              sx={{
                color: "#ffffff",
                "& .MuiOutlinedInput-notchedOutline": { borderColor: "#333" },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#555",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#666",
                },
                "& .MuiSelect-icon": { color: "#999" },
              }}
            >
              <MenuItem value={Gender.MALE}>Male</MenuItem>
              <MenuItem value={Gender.FEMALE}>Female</MenuItem>
              <MenuItem value={Gender.OTHER}>Other</MenuItem>
            </Select>
            {errors.gender && (
              <FormHelperText sx={{ color: "#f44336", marginLeft: 0 }}>
                {errors.gender.message}
              </FormHelperText>
            )}
          </FormControl>

          <Controller
            name="dob"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Date of Birth"
                type="date"
                margin="normal"
                error={!!errors.dob}
                helperText={errors.dob?.message}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <Box sx={{ mr: 1, display: "flex", alignItems: "center" }}>
                      <Calendar size={20} color="#999" />
                    </Box>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    color: "#ffffff",
                    "& fieldset": { borderColor: "#333" },
                    "&:hover fieldset": { borderColor: "#555" },
                    "&.Mui-focused fieldset": { borderColor: "#666" },
                  },
                  "& .MuiInputLabel-root": { color: "#999" },
                  "& .MuiInputLabel-root.Mui-focused": { color: "#ccc" },
                  "& input[type='date']": { colorScheme: "dark" },
                  "& .MuiFormHelperText-root": {
                    color: "#f44336",
                    marginLeft: 0,
                  },
                }}
              />
            )}
          />
        </div>

        <TextField
          fullWidth
          label="Bio"
          multiline
          {...register("bio")}
          margin="normal"
          rows={4}
          defaultValue={currentUser.bio || ""}
          placeholder="Tell us about yourself..."
          InputProps={{
            startAdornment: (
              <Box
                sx={{
                  mr: 1,
                  mt: 1.5,
                  display: "flex",
                  alignItems: "flex-start",
                }}
              >
                <Info size={20} color="#999" />
              </Box>
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              color: "#ffffff",
              "& fieldset": { borderColor: "#333" },
              "&:hover fieldset": { borderColor: "#555" },
              "&.Mui-focused fieldset": { borderColor: "#666" },
            },
            "& .MuiInputLabel-root": { color: "#999" },
            "& .MuiInputLabel-root.Mui-focused": { color: "#ccc" },
            "& textarea::placeholder": { color: "#555", opacity: 1 },
          }}
        />

        <div className="mt-4">
          <Typography variant="subtitle2" sx={{ color: "#ccc", mb: 2 }}>
            Account Information
          </Typography>
          <TextField
            fullWidth
            label="Email"
            defaultValue={currentUser.email || "tng.nguyn.vit@gmail.com"}
            disabled
            InputProps={{
              startAdornment: (
                <Box sx={{ mr: 1, display: "flex", alignItems: "center" }}>
                  <Mail size={20} color="#555" />
                </Box>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                color: "#777",
                backgroundColor: "#1a1a1a",
                "& fieldset": { borderColor: "#333" },
              },
              "& .MuiInputLabel-root": { color: "#666" },
              "& .Mui-disabled": {
                "-webkit-text-fill-color": "#777 !important",
              },
            }}
          />
        </div>

        <div className="flex justify-end">
          <Button
            variant="contained"
            size="large"
            type="submit"
            sx={{
              py: 1.5,
              width: "10rem",
              height: "3rem",
              borderRadius: "1rem",
              backgroundColor: "#1565C0",
              boxShadow: "0 3px 5px 2px rgba(21, 101, 192, 0.3)",
              color: "white",
              textTransform: "none",
              fontWeight: 600,
              "&:hover": {
                backgroundColor: "#0D47A1",
                boxShadow: "0 4px 8px 3px rgba(13, 71, 161, 0.4)",
              },
            }}
          >
            Submit
          </Button>
        </div>
      </div>
    </form>
  );
};

export default EditProfilePage;
