import React from "react";
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
import { manualRefreshToken } from "../api/auth.api";
import { useNavigate } from "react-router-dom";

const EditProfilePage: React.FC = () => {
  const { currentUser, reloadUser } = useUser();
  if (!currentUser) return;
  const navigate = useNavigate();

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
    if (data.file) formData.append("file", data.file);

    const res = await handleUpdateUser(formData);
    if (res.success) {
      toast.success("Update success!");
      await manualRefreshToken();
      reloadUser();
      navigate(`/${data.username}`, { replace: true });
      navigate(`/account/edit`);
    } else {
      toast.error(res.message);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setValue("file", file);
  };

  const inputClass =
    "w-full bg-neutral-800 border border-neutral-700 hover:border-neutral-500 focus:border-blue-500 focus:outline-none rounded-xl px-4 py-3 text-white text-sm placeholder-neutral-500 transition-colors";
  const labelClass =
    "text-xs font-medium text-neutral-400 mb-1.5 flex items-center gap-1.5";
  const errorClass = "text-xs text-red-400 mt-1";

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-2xl space-y-5 pb-10"
    >
      <div className="flex items-center justify-between bg-neutral-800/60 border border-neutral-700 rounded-2xl py-4 px-5">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <img
              src={currentUser?.avatar || assets.profile}
              alt={currentUser.fullName}
              className="w-16 h-16 rounded-full object-cover border-2 border-neutral-700"
            />
            <label className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <Camera size={20} className="text-white" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          </div>
          <div>
            <p className="text-white font-semibold text-sm">
              {currentUser.username}
            </p>
            <p className="text-neutral-400 text-xs mt-0.5">
              {currentUser.fullName}
            </p>
          </div>
        </div>
        <label className="bg-blue-600 hover:bg-blue-700 cursor-pointer text-white text-xs font-medium px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors">
          <Camera size={14} />
          Change photo
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>
      </div>

      <div>
        <label className={labelClass}>
          <User size={13} /> Full name
        </label>
        <input
          {...register("fullName")}
          placeholder="Your full name"
          className={inputClass}
        />
        {errors.fullName && (
          <p className={errorClass}>{errors.fullName.message}</p>
        )}
      </div>

      <div>
        <label className={labelClass}>
          <AtSign size={13} /> Username
        </label>
        <input
          {...register("username")}
          placeholder="your_username"
          className={inputClass}
        />
        {errors.username ? (
          <p className={errorClass}>{errors.username.message}</p>
        ) : (
          <p className="text-xs text-neutral-500 mt-1">
            This will be your unique username
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>
            <VenusAndMars size={13} /> Gender
          </label>
          <select
            {...register("gender")}
            value={selectedGender || ""}
            className={`${inputClass} appearance-none`}
          >
            <option value="" disabled>
              Select gender
            </option>
            <option value={Gender.MALE}>Male</option>
            <option value={Gender.FEMALE}>Female</option>
            <option value={Gender.OTHER}>Other</option>
          </select>
          {errors.gender && (
            <p className={errorClass}>{errors.gender.message}</p>
          )}
        </div>

        <div>
          <label className={labelClass}>
            <Calendar size={13} /> Date of birth
          </label>
          <Controller
            name="dob"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="date"
                className={`${inputClass} scheme-dark`}
              />
            )}
          />
          {errors.dob && <p className={errorClass}>{errors.dob.message}</p>}
        </div>
      </div>

      <div>
        <label className={labelClass}>
          <Info size={13} /> Bio
        </label>
        <textarea
          {...register("bio")}
          rows={4}
          defaultValue={currentUser.bio || ""}
          placeholder="Tell us about yourself..."
          className={`${inputClass} resize-none`}
        />
      </div>

      <div>
        <label className={labelClass}>
          <Mail size={13} /> Email
        </label>
        <input
          value={currentUser.email || ""}
          disabled
          className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-neutral-500 text-sm cursor-not-allowed"
        />
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 cursor-pointer text-white text-sm font-semibold px-8 py-2.5 rounded-xl transition-colors"
        >
          Save changes
        </button>
      </div>
    </form>
  );
};
export default EditProfilePage;
