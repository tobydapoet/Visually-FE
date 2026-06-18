import React, { useState } from "react";
import {
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress,
} from "@mui/material";
import {
  Users,
  Heart,
  Megaphone,
  TrendingUp,
  Ban,
  Wifi,
  Bookmark,
  Flag,
  MessageCircle,
  DollarSign,
  Eye,
  UserCheck,
  Video,
  Trash2,
  ImageIcon,
  Clock,
  CheckCircle,
  FileText,
} from "lucide-react";
import type { Period } from "../types/api/stats.type";
import { useDashboardStats } from "../hooks/useDashboardStats";
import { useTranslation } from "../hooks/useTranslation";

const colorMap = {
  purple: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
  blue: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  green: "bg-green-500/10 text-green-400 border border-green-500/20",
  red: "bg-red-500/10 text-red-400 border border-red-500/20",
  yellow: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
  pink: "bg-pink-500/10 text-pink-400 border border-pink-500/20",
  cyan: "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20",
  orange: "bg-orange-500/10 text-orange-400 border border-orange-500/20",
  teal: "bg-teal-500/10 text-teal-400 border border-teal-500/20",
};

type Color = keyof typeof colorMap;

const StatCard = ({
  label,
  value,
  icon: Icon,
  color = "purple",
  trend,
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  color?: Color;
  trend?: number;
}) => (
  <div className="bg-zinc-800/60 border border-zinc-700/50 rounded-2xl p-4 flex flex-col gap-3 transition-colors">
    <div className="flex items-center justify-between">
      <div className={`p-2 rounded-xl ${colorMap[color]}`}>
        <Icon size={16} />
      </div>
      {trend !== undefined && (
        <span
          className={`text-xs font-medium ${trend >= 0 ? "text-green-400" : "text-red-400"}`}
        >
          {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}%
        </span>
      )}
    </div>
    <div>
      <p className="text-zinc-400 text-xs mb-1">{label}</p>
      <p className="text-white font-semibold text-xl">
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
    </div>
  </div>
);

const Section = ({
  title,
  color,
  children,
}: {
  title: string;
  color: string;
  children: React.ReactNode;
}) => (
  <div className="bg-zinc-800/30 border border-zinc-700/30 rounded-2xl p-4">
    <div className="flex items-center gap-2 mb-4">
      <div className={`w-1.5 h-4 rounded-full ${color}`} />
      <h2 className="text-zinc-200 font-medium text-sm">{title}</h2>
    </div>
    {children}
  </div>
);

const DashboardPage: React.FC = () => {
  const [period, setPeriod] = useState<Period>("day");
  const { data, loading, error } = useDashboardStats(period);
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-zinc-900 p-3 sm:p-4 md:p-6 w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">
            {t("dashboard")}
          </h1>
          <p className="text-neutral-400 text-sm">{t("system_overview")}</p>
        </div>
        <ToggleButtonGroup
          value={period}
          exclusive
          size="small"
          onChange={(_, val) => val && setPeriod(val)}
          sx={{
            "& .MuiToggleButton-root": {
              color: "#a1a1aa",
              borderColor: "#3f3f46",
              fontSize: "12px",
              padding: "4px 14px",
              textTransform: "none",
              "&.Mui-selected": {
                color: "#ffffff",
                backgroundColor: "#3f3f46",
              },
            },
          }}
        >
          <ToggleButton value="day">{t("today")}</ToggleButton>
          <ToggleButton value="week">{t("week")}</ToggleButton>
          <ToggleButton value="month">{t("month")}</ToggleButton>
        </ToggleButtonGroup>
      </div>

      {loading && (
        <div className="flex justify-center items-center h-64">
          <CircularProgress size={28} sx={{ color: "#71717a" }} />
        </div>
      )}

      {error && (
        <div className="bg-red-900/20 border border-red-800/50 text-red-400 rounded-2xl p-4 text-sm">
          {error}
        </div>
      )}

      {data && !loading && (
        <div className="flex flex-col gap-4">
          {/* Content */}
          <Section title={t("content")} color="bg-teal-500">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <StatCard
                label={t("total_posts")}
                value={data.content.post.total}
                icon={FileText}
                color="teal"
              />
              <StatCard
                label={t("new_posts")}
                value={data.content.post.today}
                icon={TrendingUp}
                color="teal"
              />
              <StatCard
                label={t("active_posts")}
                value={data.content.post.active}
                icon={CheckCircle}
                color="green"
              />
              <StatCard
                label={t("banned_posts")}
                value={data.content.post.banned}
                icon={Ban}
                color="red"
              />
              <StatCard
                label={t("deleted_posts")}
                value={data.content.post.deleted}
                icon={Trash2}
                color="yellow"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
              <StatCard
                label={t("new_shorts")}
                value={data.content.short.today}
                icon={Video}
                color="cyan"
              />
              <StatCard
                label={t("new_stories")}
                value={data.content.story.today}
                icon={ImageIcon}
                color="pink"
              />
              <StatCard
                label={t("expired_stories")}
                value={data.content.story.expired}
                icon={Clock}
                color="yellow"
              />
            </div>
          </Section>

          {/* User */}
          <Section title={t("users")} color="bg-purple-500">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <StatCard
                label={t("total_users")}
                value={data.user.total}
                icon={Users}
                color="purple"
              />
              <StatCard
                label={t("new_users")}
                value={data.user.newUsers}
                icon={TrendingUp}
                color="purple"
              />
              <StatCard
                label={t("active_users")}
                value={data.user.active}
                icon={UserCheck}
                color="green"
              />
              <StatCard
                label={t("banned_users")}
                value={data.user.banned}
                icon={Ban}
                color="red"
              />
              <StatCard
                label={t("online_users")}
                value={data.user.online}
                icon={Wifi}
                color="cyan"
              />
            </div>
          </Section>

          {/* Interaction */}
          <Section title={t("interactions")} color="bg-pink-500">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard
                label={t("likes_title")}
                value={data.interaction.like.today}
                icon={Heart}
                color="pink"
              />
              <StatCard
                label={t("comments")}
                value={data.interaction.comment.today}
                icon={MessageCircle}
                color="blue"
              />
              <StatCard
                label={t("saves")}
                value={data.interaction.save.today}
                icon={Bookmark}
                color="yellow"
              />
              <StatCard
                label={t("new_reports")}
                value={data.interaction.report.today}
                icon={Flag}
                color="red"
              />
            </div>
          </Section>

          {/* Ad */}
          <Section title={t("advertisements")} color="bg-orange-500">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <StatCard
                label={t("total_ads")}
                value={data.ad.total}
                icon={Megaphone}
                color="orange"
              />
              <StatCard
                label={t("active_ads")}
                value={data.ad.active}
                icon={TrendingUp}
                color="green"
              />
              <StatCard
                label={t("inactive_ads")}
                value={data.ad.inactive}
                icon={Ban}
                color="yellow"
              />
              <StatCard
                label={t("total_views")}
                value={data.ad.totalViews}
                icon={Eye}
                color="cyan"
              />
              <StatCard
                label={t("total_spent")}
                value={`$${Number(data.ad.totalSpent).toLocaleString()}`}
                icon={DollarSign}
                color="purple"
              />
            </div>
          </Section>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
