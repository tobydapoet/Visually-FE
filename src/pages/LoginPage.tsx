import React, { useEffect } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import assets from "../assets";
import { Link, useNavigate } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginSchema, type LoginType } from "../types/schemas/login.schema";
import { handleLogin } from "../api/auth.api";
import { toast } from "sonner";
import parseJwt from "../utils/parseToken";
import Cookies from "js-cookie";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(LoginSchema),
    mode: "onBlur",
  });

  useEffect(() => {
    const refresh_token = Cookies.get("refresh_token");
    if (refresh_token) {
      navigate("/unauthorized");
    }
  }, []);

  const onSubmit = async (data: LoginType) => {
    const res = await handleLogin(data);
    if (res.success) {
      toast.success("Login success!");
      const token = Cookies.get("access_token");
      if (!token) {
        navigate("/login");
      } else {
        const payload = parseJwt(token);
        const isAdmin = payload?.role !== "CLIENT";
        if (isAdmin) {
          navigate("/music_library");
        } else {
          navigate("/");
        }
      }
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div className="flex items-center justify-center">
      <div className="flex items-center justify-center py-2 w-full">
        <form className="w-full max-w-lg" onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-10 flex items-center">
            <img
              src={assets.logo}
              alt="logo"
              className="w-10 h-auto drop-shadow-lg"
            />
            <div className="text-blue-400 text-3xl font-extrabold [text-shadow:0_2px_4px_rgba(0,0,0,0.15)]">
              Visually
            </div>
          </div>

          <div className="mb-8">
            <h1 className="font-plus text-3xl font-bold text-white">
              Welcome back!
            </h1>
            <p className="mt-2 text-gray-400">Please sign in to your account</p>
          </div>

          <div className="flex flex-col gap-5">
            <TextField
              {...register("email")}
              error={!!errors.email}
              helperText={errors.email?.message}
              fullWidth
              id="email"
              label="Email address"
              variant="outlined"
              size="medium"
              sx={{
                "& .MuiInputLabel-root": { color: "#9ca3af" },
                "& .MuiOutlinedInput-root": {
                  color: "white",
                  "& fieldset": { borderColor: "#4b5563" },
                  "&:hover fieldset": { borderColor: "#60a5fa" },
                },
              }}
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
            />

            <TextField
              {...register("password")}
              fullWidth
              error={!!errors.password}
              helperText={errors.password?.message}
              id="password"
              label="Password"
              type="password"
              variant="outlined"
              size="medium"
              sx={{
                "& .MuiInputLabel-root": { color: "#9ca3af" },
                "& .MuiOutlinedInput-root": {
                  color: "white",
                  "& fieldset": { borderColor: "#4b5563" },
                  "&:hover fieldset": { borderColor: "#60a5fa" },
                },
              }}
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
            />

            <div className="flex items-center justify-between">
              <Controller
                name="remember"
                control={control}
                defaultValue={false}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        {...field}
                        checked={field.value}
                        size="small"
                        sx={{
                          color: "#9ca3af",
                          "&.Mui-checked": { color: "#60a5fa" },
                        }}
                      />
                    }
                    label="Remember me"
                    className="text-gray-400"
                  />
                )}
              />
              <Link
                to="/forgot"
                className="text-sm font-medium text-blue-400 hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <div>
              <div className="flex gap-4">
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  type="submit"
                  sx={{
                    py: 1.5,
                    background:
                      "linear-gradient(45deg, #2196f3 30%, #42a5f5 90%)",
                    boxShadow: "0 3px 5px 2px rgba(33, 150, 243, 0.3)",
                    color: "white",
                    "&:hover": {
                      background:
                        "linear-gradient(45deg, #1e88e5 30%, #2196f3 90%)",
                      boxShadow: "0 4px 8px 3px rgba(33, 150, 243, 0.4)",
                    },
                  }}
                >
                  Sign In
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  size="large"
                  onClick={() => navigate("/register")}
                  sx={{
                    py: 1.5,
                    borderWidth: 2,
                    borderColor: "#4b5563",
                    color: "#e5e7eb",
                    backgroundColor: "transparent",
                    "&:hover": {
                      borderColor: "#60a5fa",
                      color: "#60a5fa",
                    },
                  }}
                >
                  Sign Up
                </Button>
              </div>

              <Button
                fullWidth
                variant="outlined"
                onClick={() => {
                  const redirectUri = encodeURIComponent(
                    window.location.origin + "/",
                  );
                  window.location.href = `${import.meta.env.VITE_OAUTH_URL}?redirectUri=${redirectUri}`;
                }}
                size="large"
                startIcon={
                  <img src={assets.google} alt="google" className="w-5 h-5" />
                }
                sx={{
                  marginTop: "1rem",
                  py: 1.5,
                  borderWidth: "1.5px",
                  borderColor: "#4b5563",
                  color: "#e5e7eb",
                  backgroundColor: "transparent",
                  textTransform: "none",
                  fontSize: "1rem",
                  "&:hover": {
                    borderColor: "#60a5fa",
                    color: "#60a5fa",
                  },
                }}
              >
                Sign in with Google
              </Button>
            </div>
          </div>

          <div className="text-[12px] text-gray-500 mt-10">
            By signing in, you agree to our{" "}
            <span className="text-red-400 cursor-pointer hover:underline">
              Terms of Service
            </span>{" "}
            and{" "}
            <span className="text-red-400 cursor-pointer hover:underline">
              Privacy Policy
            </span>
            .
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
