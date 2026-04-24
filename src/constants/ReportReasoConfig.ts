import {
  CircleAlert,
  Eye,
  EyeOff,
  HandFist,
  HeartCrack,
  Mail,
  MessageCircleWarning,
  PackageX,
} from "lucide-react";
import type { ReportReason } from "./reportReason.enum";

export const reasonConfig: Record<
  ReportReason,
  { label: string; icon: React.ElementType; description: string }
> = {
  NOT_INTERESTED: {
    label: "Not interested",
    icon: EyeOff,
    description: "You don't want to see this content",
  },
  BULLYING: {
    label: "Bullying / Harassment",
    icon: MessageCircleWarning,
    description: "Targeted harassment or threats",
  },
  SELF_HARM: {
    label: "Self-harm",
    icon: HeartCrack,
    description: "Content promoting self-harm or suicide",
  },
  VIOLENCE: {
    label: "Violence",
    icon: HandFist,
    description: "Graphic violence or threats",
  },
  RESTRICTED_ITEMS: {
    label: "Restricted items",
    icon: PackageX,
    description: "Illegal or regulated goods",
  },
  NUDITY: {
    label: "Nudity / Sexual content",
    icon: Eye,
    description: "Sexually explicit material",
  },
  SPAM: {
    label: "Spam",
    icon: Mail,
    description: "Repetitive or unwanted content",
  },
  FALSE_INFO: {
    label: "False information",
    icon: CircleAlert,
    description: "Misleading or fake news",
  },
};
