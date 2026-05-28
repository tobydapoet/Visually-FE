import type { FC } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
  Box,
  Typography,
  Paper,
} from "@mui/material";
import {
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import {
  ResetPasswordSchema,
  type ResetPasswordType,
} from "../types/schemas/resetPassword.schema";
import { handleResetPasswod } from "../api/auth.api";
import { useTranslation } from "../hooks/useTranslation";

const textFieldSx = {
  "& .MuiOutlinedInput-root": {
    color: "#fff",
    backgroundColor: "#1a1a2e",
    "& fieldset": { borderColor: "#2d2d44" },
    "&:hover fieldset": { borderColor: "#3b82f6" },
    "&.Mui-focused fieldset": { borderColor: "#3b82f6" },
  },
  "& .MuiInputLabel-root": { color: "#6b7280" },
  "& .MuiInputLabel-root.Mui-focused": { color: "#3b82f6" },
  "& .MuiFormHelperText-root": { color: "#ef4444" },
  "& input::-ms-reveal": { display: "none" },
  "& input::-ms-clear": { display: "none" },
};

const ResetPasswordPage: FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const resetToken = searchParams.get("token") || "";

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const [success, setSuccess] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordType>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: {
      resetToken,
      password: "",
      confirmPassword: "",
    },
  });
  const { t } = useTranslation();

  const onSubmit = async (data: ResetPasswordType) => {
    setGeneralError("");
    setSuccess("");

    const result = await handleResetPasswod(data);

    if (result.success) {
      setSuccess(t("reset_password_success"));
      setTimeout(() => navigate("/login"), 2000);
    } else {
      setGeneralError(result.message || t("reset_password_failed"));
    }
  };

  if (!resetToken) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "#0f0f1a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
        }}
      >
        <Paper
          sx={{
            maxWidth: 420,
            width: "100%",
            bgcolor: "#1a1a2e",
            borderRadius: 3,
            p: 4,
            textAlign: "center",
            border: "1px solid #2d2d44",
          }}
        >
          <Box
            sx={{
              width: 64,
              height: 64,
              bgcolor: "#2d1a1a",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 2,
            }}
          >
            <AlertCircle size={32} color="#ef4444" />
          </Box>
          <Typography
            variant="h6"
            sx={{ color: "#fff", fontWeight: 600, mb: 1 }}
          >
            {t("invalid_reset_link")}
          </Typography>
          <Typography sx={{ color: "#6b7280", mb: 3, fontSize: 14 }}>
            {t("invalid_reset_link_message")}
          </Typography>
          <Button
            onClick={() => navigate("/forgot-password")}
            variant="contained"
            sx={{
              bgcolor: "#3b82f6",
              "&:hover": { bgcolor: "#2563eb" },
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            {t("request_new_reset_link")}
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#0f0f1a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      <Paper
        sx={{
          maxWidth: 420,
          width: "100%",
          bgcolor: "#1a1a2e",
          borderRadius: 3,
          p: 4,
          border: "1px solid #2d2d44",
        }}
      >
        <Button
          onClick={() => navigate("/login")}
          startIcon={<ArrowLeft size={18} />}
          sx={{
            color: "#6b7280",
            textTransform: "none",
            mb: 3,
            p: 0,
            "&:hover": { color: "#fff", bgcolor: "transparent" },
          }}
        >
          {t("back_to_login")}
        </Button>

        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Box
            sx={{
              width: 64,
              height: 64,
              bgcolor: "#1a2744",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 2,
            }}
          >
            <Lock size={32} color="#3b82f6" />
          </Box>
          <Typography variant="h5" sx={{ color: "#fff", fontWeight: 700 }}>
            {t("reset_password_title")}
          </Typography>
          <Typography sx={{ color: "#6b7280", mt: 1, fontSize: 14 }}>
            {t("reset_password_subtitle")}
          </Typography>
        </Box>

        {generalError && (
          <Alert
            icon={<AlertCircle size={18} />}
            severity="error"
            sx={{
              mb: 2,
              bgcolor: "#2d1a1a",
              color: "#ef4444",
              border: "1px solid #3d2020",
            }}
          >
            {generalError}
          </Alert>
        )}
        {success && (
          <Alert
            icon={<CheckCircle size={18} />}
            severity="success"
            sx={{
              mb: 2,
              bgcolor: "#1a2d1a",
              color: "#22c55e",
              border: "1px solid #203d20",
            }}
          >
            {success}
          </Alert>
        )}

        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{ display: "flex", flexDirection: "column", gap: 3 }}
        >
          <input type="hidden" {...register("resetToken")} />

          <TextField
            label={t("new_password")}
            placeholder={t("enter_new_password")}
            type={showPassword ? "text" : "password"}
            fullWidth
            {...register("password")}
            error={!!errors.password}
            helperText={
              errors.password?.message ? t(errors.password.message as any) : ""
            }
            sx={textFieldSx}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    sx={{ color: "#6b7280", "&:hover": { color: "#3b82f6" } }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            type={showConfirmPassword ? "text" : "password"}
            label={t("confirm_password")}
            placeholder={t("confirm_new_password")}
            fullWidth
            {...register("confirmPassword")}
            error={!!errors.confirmPassword}
            helperText={
              errors.confirmPassword?.message
                ? t(errors.confirmPassword.message as any)
                : ""
            }
            sx={textFieldSx}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    sx={{ color: "#6b7280", "&:hover": { color: "#3b82f6" } }}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            fullWidth
            startIcon={
              isSubmitting ? (
                <CircularProgress size={18} sx={{ color: "#4b6fa8" }} />
              ) : null
            }
            sx={{
              bgcolor: "#3b82f6",
              "&:hover": { bgcolor: "#2563eb" },
              "&:disabled": { bgcolor: "#1e3a5f", color: "#4b6fa8" },
              borderRadius: 2,
              py: 1.2,
              textTransform: "none",
              fontWeight: 600,
              fontSize: 15,
            }}
          >
            {isSubmitting ? t("resetting") : t("reset_password_btn")}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default ResetPasswordPage;
