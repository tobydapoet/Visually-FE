import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import type React from "react";
import { useEffect, useState } from "react";
import {
  X,
  ArrowRight,
  ArrowLeft,
  Check,
  Users,
  CreditCard,
  Wallet,
  Clock,
  Coins,
  UserCheck,
  FileCheck,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { CreateAdSchema, type CreateAdType } from "../types/schemas/ad.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { handleCreateAd } from "../api/ad.api";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onClose: () => void;
  contentId: number;
  type: "POST" | "SHORT";
};

const CreateAdPopUp: React.FC<Props> = ({ open, onClose, contentId, type }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const {
    register,
    formState: { errors, isSubmitting },
    handleSubmit,
    setValue,
    watch,
    reset,
    trigger,
  } = useForm<CreateAdType>({
    resolver: zodResolver(CreateAdSchema),
    mode: "onChange",
  });

  const watchedValues = watch();

  useEffect(() => {
    if (open) {
      reset({
        dailyBudget: 1000,
        time: 24,
        ageMin: 18,
        ageMax: 35,
        gender: "ALL",
        type: type,
        contentId: contentId,
      });
      setCurrentStep(1);
    }
  }, [open, reset]);

  const nextStep = async () => {
    let fieldsToValidate: (keyof CreateAdType)[] = [];

    if (currentStep === 1) {
      fieldsToValidate = ["dailyBudget", "time"];
    } else if (currentStep === 2) {
      fieldsToValidate = ["ageMin", "ageMax", "gender"];
    }

    const isValid = await trigger(fieldsToValidate);

    if (isValid && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const onSubmit = async (data: CreateAdType) => {
    console.log("DATA: ", data);
    const res = await handleCreateAd(data);
    if (res.success) {
      toast.success(res.message);
      onClose();
      reset();
    } else {
      toast.error(res.message);
    }
  };

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatHours = (hours: number) => {
    if (hours >= 24) {
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;
      if (remainingHours === 0) return `${days} day${days > 1 ? "s" : ""}`;
      return `${days}d ${remainingHours}h`;
    }
    return `${hours} hour${hours > 1 ? "s" : ""}`;
  };

  const getEstimatedReach = () => {
    const baseReach = 5000;
    const budgetFactor = watchedValues.dailyBudget / 10000;
    const timeFactor = watchedValues.time / 24;
    return Math.floor(baseReach * budgetFactor * timeFactor);
  };

  const StepIndicator = ({
    step,
    title,
  }: {
    step: number;
    title: string;
    icon: React.ElementType;
  }) => (
    <div className="flex items-center gap-2">
      <div
        className={`
        w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all
        ${
          currentStep >= step
            ? "bg-blue-500 text-white"
            : "bg-zinc-800 text-zinc-500"
        }
        ${currentStep === step ? "ring-2 ring-blue-400/50" : ""}
      `}
      >
        {currentStep > step ? <Check className="w-4 h-4" /> : step}
      </div>
      <span
        className={`text-xs hidden sm:inline ${currentStep >= step ? "text-blue-400" : "text-zinc-500"}`}
      >
        {title}
      </span>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <div className="w-14 h-14 bg-linear-to-br from-blue-500/20 to-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <Coins className="w-7 h-7 text-blue-400" />
        </div>
        <h3 className="text-lg font-semibold text-white">Budget & Duration</h3>
        <p className="text-xs text-zinc-400 mt-1">
          Set your daily budget and campaign duration
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-2">
          Daily Budget <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">
            ₫
          </span>
          <input
            type="number"
            {...register("dailyBudget", { valueAsNumber: true })}
            className={`w-full pl-8 pr-4 py-3 bg-zinc-800/50 border rounded-xl 
              text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all
              ${errors.dailyBudget ? "border-red-500" : "border-zinc-700"}`}
          />
        </div>
        {errors.dailyBudget && (
          <p className="text-xs text-red-400 mt-2">
            {errors.dailyBudget.message}
          </p>
        )}

        <div className="flex gap-2 mt-3">
          {[1000, 5000, 10000, 20000].map((budget) => (
            <button
              key={budget}
              type="button"
              onClick={() =>
                setValue("dailyBudget", budget, { shouldValidate: true })
              }
              className="px-3 py-1.5 text-xs rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-all"
            >
              {formatVND(budget)}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-2">
          Duration (hours) <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="number"
            {...register("time", { valueAsNumber: true })}
            className={`w-full pl-12 pr-4 py-3 bg-zinc-800/50 border rounded-xl 
              text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all
              ${errors.time ? "border-red-500" : "border-zinc-700"}`}
          />
        </div>
        {errors.time && (
          <p className="text-xs text-red-400 mt-2">{errors.time.message}</p>
        )}

        <div className="flex gap-2 mt-3">
          {[24, 72, 168, 336, 720].map((hours) => (
            <button
              key={hours}
              type="button"
              onClick={() => setValue("time", hours, { shouldValidate: true })}
              className="px-3 py-1.5 text-xs rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-all"
            >
              {formatHours(hours)}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 p-4 bg-linear-to-r from-blue-500/10 to-transparent rounded-xl border border-blue-500/20">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-zinc-300">Total Budget</span>
          <span className="text-xl font-bold text-white">
            {formatVND(
              watchedValues.dailyBudget * Math.ceil(watchedValues.time / 24),
            )}
          </span>
        </div>
        <div className="flex justify-between items-center text-xs text-zinc-400">
          <span>Daily: {formatVND(watchedValues.dailyBudget)}</span>
          <span>Duration: {formatHours(watchedValues.time)}</span>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <div className="w-14 h-14 bg-linear-to-br from-emerald-500/20 to-teal-500/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <UserCheck className="w-7 h-7 text-emerald-400" />
        </div>
        <h3 className="text-lg font-semibold text-white">Target Audience</h3>
        <p className="text-xs text-zinc-400 mt-1">
          Define who will see your ad
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-3">
          Age Range <span className="text-red-400">*</span>
        </label>
        <div className="flex gap-4 items-center">
          <div className="flex-1">
            <input
              type="number"
              {...register("ageMin", { valueAsNumber: true })}
              className={`w-full px-4 py-3 bg-zinc-800/50 border rounded-xl 
                text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-center
                ${errors.ageMin ? "border-red-500" : "border-zinc-700"}`}
            />
          </div>
          <span className="text-zinc-500 text-xl">→</span>
          <div className="flex-1">
            <input
              type="number"
              {...register("ageMax", { valueAsNumber: true })}
              className={`w-full px-4 py-3 bg-zinc-800/50 border rounded-xl 
                text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-center
                ${errors.ageMax ? "border-red-500" : "border-zinc-700"}`}
            />
          </div>
        </div>
        {errors.ageMin && (
          <p className="text-xs text-red-400 mt-2">{errors.ageMin.message}</p>
        )}
        {errors.ageMax && (
          <p className="text-xs text-red-400 mt-2">{errors.ageMax.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-2">
          Gender <span className="text-red-400">*</span>
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: "ALL", label: "All", desc: "Everyone" },
            { value: "MALE", label: "Male", desc: "Men only" },
            { value: "FEMALE", label: "Female", desc: "Women only" },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() =>
                setValue("gender", option.value as any, {
                  shouldValidate: true,
                })
              }
              className={`
                py-3 rounded-xl border transition-all text-center
                ${
                  watchedValues.gender === option.value
                    ? "border-emerald-500 bg-emerald-500/10"
                    : "border-zinc-700 bg-zinc-800/50 hover:border-zinc-600"
                }
              `}
            >
              <p
                className={`text-sm font-medium ${watchedValues.gender === option.value ? "text-emerald-400" : "text-zinc-300"}`}
              >
                {option.label}
              </p>
              <p className="text-xs text-zinc-500">{option.desc}</p>
            </button>
          ))}
        </div>
        {errors.gender && (
          <p className="text-xs text-red-400 mt-2">{errors.gender.message}</p>
        )}
      </div>

      <div className="mt-4 p-4 bg-linear-to-r from-emerald-500/10 to-transparent rounded-xl border border-emerald-500/20">
        <div className="flex items-center gap-2 text-emerald-400 mb-2">
          <Users className="w-4 h-4" />
          <span className="text-xs font-medium">Estimated Audience Size</span>
        </div>
        <p className="text-2xl font-bold text-white">
          ~{(getEstimatedReach() / 1000).toFixed(0)}K
        </p>
        <p className="text-xs text-zinc-500 mt-1">
          potential viewers based on targeting
        </p>
      </div>
    </div>
  );

  const renderStep3 = () => {
    const totalBudget =
      watchedValues.dailyBudget * Math.ceil(watchedValues.time / 24);

    return (
      <div className="space-y-5">
        <div className="text-center mb-4">
          <div className="w-14 h-14 bg-linear-to-br from-amber-500/20 to-orange-500/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <FileCheck className="w-7 h-7 text-amber-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">Review & Payment</h3>
          <p className="text-xs text-zinc-400 mt-1">
            Confirm your campaign details
          </p>
        </div>

        <div className="bg-zinc-800/30 rounded-xl border border-zinc-700 overflow-hidden">
          <div className="p-4 border-b border-zinc-700">
            <p className="text-xs text-zinc-400 uppercase tracking-wide">
              Campaign Summary
            </p>
          </div>

          <div className="p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-zinc-400">Daily Budget</span>
              <span className="text-sm font-semibold text-white">
                {formatVND(watchedValues.dailyBudget)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-zinc-400">Duration</span>
              <span className="text-sm font-semibold text-white">
                {formatHours(watchedValues.time)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-zinc-400">Age Range</span>
              <span className="text-sm font-semibold text-white">
                {watchedValues.ageMin} - {watchedValues.ageMax}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-zinc-400">Gender</span>
              <span className="text-sm font-semibold text-white">
                {watchedValues.gender === "ALL"
                  ? "All"
                  : watchedValues.gender === "MALE"
                    ? "Male"
                    : "Female"}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-zinc-700">
              <span className="text-base font-medium text-white">
                Total Amount
              </span>
              <span className="text-xl font-bold text-emerald-400">
                {formatVND(totalBudget)}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const isStepValid = () => {
    if (currentStep === 1) {
      return (
        !errors.dailyBudget &&
        !errors.time &&
        watchedValues.dailyBudget >= 1000 &&
        watchedValues.time >= 1
      );
    }
    if (currentStep === 2) {
      return (
        !errors.ageMin &&
        !errors.ageMax &&
        !errors.gender &&
        watchedValues.ageMin <= watchedValues.ageMax
      );
    }
    return true;
  };

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/80" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel
          transition
          className="w-full max-w-lg rounded-2xl bg-zinc-900 border border-zinc-800
            text-white duration-300 ease-out
            data-closed:scale-95 data-closed:opacity-0"
        >
          <DialogTitle className="flex items-center justify-between px-5 py-3 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="text-md font-semibold text-white">
                Boots<span className="text-blue-400">Post</span>
              </span>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center cursor-pointer justify-center rounded-lg 
                hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </DialogTitle>

          <div className="flex justify-between px-5 pt-4 pb-2 border-b border-zinc-800/50">
            <StepIndicator step={1} title="Budget" icon={Coins} />
            <StepIndicator step={2} title="Audience" icon={Users} />
            <StepIndicator step={3} title="Payment" icon={CreditCard} />
          </div>

          <div className="p-5 min-h-115 max-h-[60vh] overflow-y-auto custom-scrollbar">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
          </div>

          <div className="flex justify-between gap-3 px-5 py-4 border-t border-zinc-800">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`
                px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2
                ${
                  currentStep === 1
                    ? "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                    : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white"
                }
              `}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            {currentStep < totalSteps ? (
              <button
                onClick={nextStep}
                disabled={!isStepValid()}
                className={`
                  px-5 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2
                  ${
                    isStepValid()
                      ? "bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/20"
                      : "bg-zinc-700 text-zinc-500 cursor-not-allowed"
                  }
                `}
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit(onSubmit)}
                disabled={isSubmitting || !isStepValid()}
                className={`
                  px-5 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2
                  ${
                    isStepValid() && !isSubmitting
                      ? "bg-linear-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 shadow-lg shadow-emerald-600/20"
                      : "bg-zinc-700 text-zinc-500 cursor-not-allowed"
                  }
                `}
              >
                <Wallet className="w-4 h-4" />
                {isSubmitting
                  ? "Processing..."
                  : `Pay ${formatVND(watchedValues.dailyBudget * Math.ceil(watchedValues.time / 24))}`}
              </button>
            )}
          </div>
        </DialogPanel>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #3f3f46;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #52525b;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #71717a;
        }
      `}</style>
    </Dialog>
  );
};

export default CreateAdPopUp;
