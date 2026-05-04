import React, { useEffect } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import assets from "../assets";
import { Link, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import BirthField from "../components/BirthField";
import {
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  Radio,
  RadioGroup,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import Cookies from "js-cookie";

import { Venus, Mars, Transgender, ChevronLeft } from "lucide-react";
import {
  RegisterSchema,
  type RegisterType,
} from "../types/schemas/register.schema";
import { Gender } from "../constants/gender.enum";
import { handleRegister } from "../api/auth.api";
import { toast } from "sonner";

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(RegisterSchema),
    mode: "onBlur",
  });

  useEffect(() => {
    const refresh_token = Cookies.get("refresh_token");
    if (refresh_token) {
      navigate("/unauthorized");
    }
  }, []);

  const onSubmit = async (data: RegisterType) => {
    const res = await handleRegister(data);
    if (res.success) {
      toast.success("Register success!");
      navigate("/login");
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div className="flex items-center justify-center bg-zinc-900 min-h-screen">
      <div className="flex items-center justify-center py-8">
        <div className="w-screen max-w-lg px-10 md:px-0">
          <div className="mb-8 flex items-center">
            <div onClick={() => navigate("/login")}>
              <ChevronLeft color="#fff" className="cursor-pointer" />
            </div>

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
              Get started on Visually
            </h1>
            <p className="mt-2 text-gray-400">
              Sign up to see photos and videos from your friends.
            </p>
          </div>

          <form
            className="flex flex-col gap-8"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="space-y-4">
              <div className="border-b border-gray-700 pb-2">
                <h2 className="text-lg font-semibold text-white">
                  Account Information
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  Your login credentials
                </p>
              </div>

              <TextField
                fullWidth
                id="email"
                {...register("email")}
                error={!!errors.email}
                helperText={errors.email?.message}
                label="Email Address"
                variant="outlined"
                size="medium"
                margin="normal"
                sx={{
                  "& .MuiInputLabel-root": { color: "white" },
                  "& .MuiInputLabel-root.Mui-focused": { color: "#2196f3" },
                  "& .MuiOutlinedInput-root": {
                    color: "white",
                    "& fieldset": { borderColor: "white" },
                    "&:hover fieldset": { borderColor: "#2196f3" },
                    "&.Mui-focused fieldset": { borderColor: "#2196f3" },
                  },
                }}
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
              />

              <TextField
                fullWidth
                id="password"
                label="Password"
                type="password"
                {...register("password")}
                error={!!errors.password}
                helperText={errors.password?.message}
                variant="outlined"
                size="medium"
                margin="normal"
                sx={{
                  "& .MuiInputLabel-root": { color: "white" },
                  "& .MuiInputLabel-root.Mui-focused": { color: "#2196f3" },
                  "& .MuiOutlinedInput-root": {
                    color: "white",
                    "& fieldset": { borderColor: "white" },
                    "&:hover fieldset": { borderColor: "#2196f3" },
                    "&.Mui-focused fieldset": { borderColor: "#2196f3" },
                  },
                }}
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
              />

              <TextField
                fullWidth
                id="confirmPassword"
                label="Confirm Password"
                type="password"
                {...register("confirmPassword")}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword?.message}
                variant="outlined"
                size="medium"
                margin="normal"
                sx={{
                  "& .MuiInputLabel-root": { color: "white" },
                  "& .MuiInputLabel-root.Mui-focused": { color: "#2196f3" },
                  "& .MuiOutlinedInput-root": {
                    color: "white",
                    "& fieldset": { borderColor: "white" },
                    "&:hover fieldset": { borderColor: "#2196f3" },
                    "&.Mui-focused fieldset": { borderColor: "#2196f3" },
                  },
                }}
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
              />
            </div>

            <div className="space-y-4">
              <div className="border-b border-gray-700 pb-2">
                <h2 className="text-lg font-semibold text-white">
                  Personal Information
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  Tell us about yourself
                </p>
              </div>

              <TextField
                fullWidth
                id="fullName"
                label="Full Name"
                {...register("fullName")}
                error={!!errors.fullName}
                helperText={errors.fullName?.message}
                variant="outlined"
                size="medium"
                margin="normal"
                sx={{
                  "& .MuiInputLabel-root": { color: "white" },
                  "& .MuiInputLabel-root.Mui-focused": { color: "#2196f3" },
                  "& .MuiOutlinedInput-root": {
                    color: "white",
                    "& fieldset": { borderColor: "white" },
                    "&:hover fieldset": { borderColor: "#2196f3" },
                    "&.Mui-focused fieldset": { borderColor: "#2196f3" },
                  },
                }}
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
              />

              <TextField
                fullWidth
                id="username"
                label="Username"
                {...register("username")}
                error={!!errors.username}
                helperText={errors.username?.message}
                variant="outlined"
                size="medium"
                margin="normal"
                sx={{
                  "& .MuiInputLabel-root": { color: "white" },
                  "& .MuiInputLabel-root.Mui-focused": { color: "#2196f3" },
                  "& .MuiOutlinedInput-root": {
                    color: "white",
                    "& fieldset": { borderColor: "white" },
                    "&:hover fieldset": { borderColor: "#2196f3" },
                    "&.Mui-focused fieldset": { borderColor: "#2196f3" },
                  },
                }}
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
              />

              <TextField
                fullWidth
                id="phone"
                label="Phone Number"
                {...register("phone")}
                error={!!errors.phone}
                helperText={errors.phone?.message}
                variant="outlined"
                size="medium"
                sx={{
                  "& .MuiInputLabel-root": { color: "white" },
                  "& .MuiInputLabel-root.Mui-focused": { color: "#2196f3" },
                  "& .MuiOutlinedInput-root": {
                    color: "white",
                    "& fieldset": { borderColor: "white" },
                    "&:hover fieldset": { borderColor: "#2196f3" },
                    "&.Mui-focused fieldset": { borderColor: "#2196f3" },
                  },
                }}
                margin="normal"
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
              />

              <Controller
                name="gender"
                control={control}
                render={({ field }) => (
                  <FormControl
                    sx={{ width: "100%" }}
                    margin="normal"
                    error={!!errors.gender}
                  >
                    <FormLabel
                      id="gender-label"
                      sx={{
                        color: "white",
                        fontSize: "1rem",
                        fontWeight: 500,
                        mb: 1,
                        "&.Mui-focused": { color: "white" },
                      }}
                    >
                      Gender
                    </FormLabel>

                    <RadioGroup
                      {...field}
                      aria-labelledby="gender-label"
                      sx={{
                        display: "flex",
                        flexDirection: "row",
                        gap: 3,
                      }}
                    >
                      <FormControlLabel
                        value={Gender.MALE}
                        control={
                          <Radio
                            icon={<Mars color="#9ca3af" size={22} />}
                            checkedIcon={<Mars color="#3b82f6" size={22} />}
                          />
                        }
                        sx={{
                          "& .MuiFormControlLabel-label": {
                            color: "#9ca3af",
                            fontSize: "0.95rem",
                          },
                          "& .Mui-checked + .MuiFormControlLabel-label": {
                            color: "#3b82f6",
                            fontWeight: 500,
                          },
                        }}
                        label="Male"
                      />

                      <FormControlLabel
                        value={Gender.FEMALE}
                        control={
                          <Radio
                            icon={<Venus color="#9ca3af" size={22} />}
                            checkedIcon={<Venus color="#ec4899" size={22} />}
                          />
                        }
                        label="Female"
                        sx={{
                          "& .MuiFormControlLabel-label": {
                            color: "#9ca3af",
                            fontSize: "0.95rem",
                          },
                          "& .Mui-checked + .MuiFormControlLabel-label": {
                            color: "#ec4899",
                            fontWeight: 500,
                          },
                        }}
                      />

                      <FormControlLabel
                        value={Gender.OTHER}
                        control={
                          <Radio
                            icon={<Transgender color="#9ca3af" size={22} />}
                            checkedIcon={
                              <Transgender color="#a855f7" size={22} />
                            }
                          />
                        }
                        label="Other"
                        sx={{
                          "& .MuiFormControlLabel-label": {
                            color: "#9ca3af",
                            fontSize: "0.95rem",
                          },
                          "& .Mui-checked + .MuiFormControlLabel-label": {
                            color: "#a855f7",
                            fontWeight: 500,
                          },
                        }}
                      />
                    </RadioGroup>
                    <FormHelperText>{errors.gender?.message}</FormHelperText>
                  </FormControl>
                )}
              />

              <FormControl error={!!errors.dob} fullWidth>
                <BirthField setValue={setValue} />

                <FormHelperText sx={{ mt: 1 }}>
                  {errors.dob?.message}
                </FormHelperText>
              </FormControl>
            </div>

            <div className="space-y-4 mt-4">
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
                Register
              </Button>

              <div className="text-center mt-4">
                <span className="text-gray-500">Have an account? </span>

                <Link
                  to="/"
                  className="text-blue-500 hover:text-blue-400 font-medium transition-colors"
                >
                  Sign In
                </Link>
              </div>
            </div>

            <div className="text-[12px] text-gray-500 mt-8 text-center">
              By registering, you agree to our{" "}
              <span className="text-red-400 cursor-pointer hover:underline hover:text-red-300">
                Terms of Service
              </span>{" "}
              and{" "}
              <span className="text-red-400 cursor-pointer hover:underline hover:text-red-300">
                Privacy Policy
              </span>
              .
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
