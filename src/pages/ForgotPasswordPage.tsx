import type { FC } from "react";
import { useState } from "react";
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  TextField,
  Button,
  Alert,
  CircularProgress,
  Box,
  Typography,
  Paper,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { handleSendOtp, handleVerifyOtp } from "../api/auth.api";
import {
  OtpSchema,
  ResendOtpSchema,
  type OtpFormType,
  type ResendOtpType,
} from "../types/schemas/resetPassword.schema";

const textFieldSx = {
  "& .MuiOutlinedInput-root": {
    color: "#fff",
    backgroundColor: "#1a1a2e",
    "& fieldset": { borderColor: "#2d2d44" },
    "&:hover fieldset": { borderColor: "#3b82f6" },
    "&.Mui-focused fieldset": { borderColor: "#3b82f6" },
    "&.Mui-disabled": {
      backgroundColor: "#13132a",
      "& fieldset": { borderColor: "#2d2d44" },
    },
  },
  "& .MuiInputLabel-root": { color: "#6b7280" },
  "& .MuiInputLabel-root.Mui-focused": { color: "#3b82f6" },
  "& .MuiFormHelperText-root": { color: "#ef4444" },
  "& input.Mui-disabled": { color: "#4b5563", WebkitTextFillColor: "#4b5563" },
};

const otpFieldSx = {
  ...textFieldSx,
  "& input": {
    textAlign: "center",
    fontSize: 24,
    letterSpacing: "0.4em",
    fontWeight: 600,
  },
};

const submitBtnSx = {
  bgcolor: "#3b82f6",
  "&:hover": { bgcolor: "#2563eb" },
  "&:disabled": { bgcolor: "#1e3a5f", color: "#4b6fa8" },
  borderRadius: 2,
  py: 1.2,
  textTransform: "none",
  fontWeight: 600,
  fontSize: 15,
};

const ForgotPasswordPage: FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<"email" | "otp">("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submittedEmail, setSubmittedEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResendOtpType>({
    resolver: zodResolver(ResendOtpSchema),
    defaultValues: { email: "" },
  });

  const otpForm = useForm<OtpFormType>({
    resolver: zodResolver(OtpSchema),
    defaultValues: { otp: "" },
  });

  const handleSendOtpSubmit = async (data: ResendOtpType) => {
    setLoading(true);
    setError("");
    setSuccess("");

    const result = await handleSendOtp(data);

    if (result.success) {
      setSubmittedEmail(data.email);
      setSuccess("OTP has been sent to your email!");
      setStep("otp");
    } else {
      setError(result.message || "Failed to send OTP. Please try again.");
    }
    setLoading(false);
  };

  const handleVerifyOtpSubmit = async (data: OtpFormType) => {
    setLoading(true);
    setError("");
    setSuccess("");

    const result = await handleVerifyOtp(submittedEmail, data.otp);

    if (result.success && result.resetToken) {
      setSuccess("OTP verified successfully!");
      setTimeout(() => {
        navigate(`/reset?token=${result.resetToken}`);
      }, 1000);
    } else {
      setError(result.message || "Invalid OTP. Please try again.");
    }
    setLoading(false);
  };

  const handleBackToEmail = () => {
    setStep("email");
    setError("");
    setSuccess("");
    otpForm.reset();
  };

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
          Back to Login
        </Button>

        {/* Header */}
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
            <Mail size={32} color="#3b82f6" />
          </Box>
          <Typography variant="h5" sx={{ color: "#fff", fontWeight: 700 }}>
            Forgot Password?
          </Typography>
          <Typography sx={{ color: "#6b7280", mt: 1, fontSize: 14 }}>
            {step === "email"
              ? "Enter your email address and we'll send you a verification code"
              : `Enter the 6-digit code sent to ${submittedEmail}`}
          </Typography>
        </Box>

        {error && (
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
            {error}
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

        {/* Step: Email */}
        {step === "email" ? (
          <Box
            component="form"
            onSubmit={handleSubmit(handleSendOtpSubmit)}
            sx={{ display: "flex", flexDirection: "column", gap: 3 }}
          >
            <TextField
              label="Email Address"
              fullWidth
              {...register("email")}
              error={!!errors.email}
              helperText={errors.email?.message}
              sx={textFieldSx}
            />

            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              fullWidth
              startIcon={
                loading ? (
                  <CircularProgress size={18} sx={{ color: "#4b6fa8" }} />
                ) : null
              }
              sx={submitBtnSx}
            >
              {loading ? "Sending..." : "Send Reset Code"}
            </Button>
          </Box>
        ) : (
          /* Step: OTP */
          <Box
            component="form"
            onSubmit={otpForm.handleSubmit(handleVerifyOtpSubmit)}
            sx={{ display: "flex", flexDirection: "column", gap: 3 }}
          >
            <TextField
              label="Email Address"
              value={submittedEmail}
              fullWidth
              disabled
              sx={textFieldSx}
            />

            <TextField
              label="Verification Code"
              fullWidth
              {...otpForm.register("otp", {
                onChange: (e) => {
                  e.target.value = e.target.value
                    .replace(/\D/g, "")
                    .slice(0, 6);
                },
              })}
              error={!!otpForm.formState.errors.otp}
              helperText={otpForm.formState.errors.otp?.message}
              inputProps={{ maxLength: 6 }}
              sx={otpFieldSx}
            />

            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              fullWidth
              startIcon={
                loading ? (
                  <CircularProgress size={18} sx={{ color: "#4b6fa8" }} />
                ) : null
              }
              sx={submitBtnSx}
            >
              {loading ? "Verifying..." : "Verify Code"}
            </Button>

            <Button
              onClick={handleBackToEmail}
              sx={{
                color: "#3b82f6",
                textTransform: "none",
                fontSize: 14,
                "&:hover": { color: "#60a5fa", bgcolor: "transparent" },
              }}
            >
              ← Back to email
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default ForgotPasswordPage;
