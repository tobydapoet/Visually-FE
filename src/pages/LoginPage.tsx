import React, { useEffect, useRef } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import assets from "../assets";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginSchema, type LoginType } from "../types/schemas/login.schema";
import { handleLogin } from "../api/auth.api";
import { toast } from "sonner";
import parseJwt from "../utils/parseToken";
import Cookies from "js-cookie";
import { useTranslation } from "../hooks/useTranslation";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useTranslation();
  const toastShown = useRef(false);
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

    const error = searchParams.get("error");
    const message = searchParams.get("message");
    if (error === "true" && !toastShown.current) {
      toastShown.current = true;
      toast.error(message || "Google login failed. Please try again!");
      setSearchParams({});
    }
  }, []);

  const onSubmit = async (data: LoginType) => {
    const res = await handleLogin(data);
    if (res.success) {
      toast.success(t("login_success"));
      const token = Cookies.get("access_token");
      if (!token) {
        navigate("/login");
      } else {
        const payload = parseJwt(token);
        const isAdmin = payload?.role !== "CLIENT";
        if (isAdmin) {
          navigate("/audit");
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
              {t("welcome_back")}
            </h1>
            <p className="mt-2 text-gray-400">{t("sign_in_subtitle")}</p>
          </div>

          <div className="flex flex-col gap-5">
            <TextField
              {...register("email")}
              error={!!errors.email}
              helperText={
                errors.email?.message ? t(errors.email.message as any) : ""
              }
              fullWidth
              id="email"
              label={t("email")}
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
              helperText={
                errors.password?.message
                  ? t(errors.password.message as any)
                  : ""
              }
              id="password"
              label={t("password")}
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
                    label={t("remember_me")}
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
                  {t("sign_in")}
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
                  {t("sign_up")}
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
                {t("sign_in_google")}
              </Button>
            </div>
          </div>

          <div className="text-[12px] text-gray-500 mt-10">
            {t("terms_prefix")}{" "}
            <span className="text-red-400 cursor-pointer hover:underline">
              {t("terms_of_service")}
            </span>{" "}
            {t("and")}{" "}
            <span className="text-red-400 cursor-pointer hover:underline">
              {t("privacy_policy")}
            </span>
            .
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
