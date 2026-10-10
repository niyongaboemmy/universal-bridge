import {
  BadgeCheck,
  Banknote,
  BookOpen,
  Brain,
  Briefcase,
  Building,
  Calendar,
  Cloud,
  Code,
  Compass,
  Cpu,
  FlaskConical,
  GraduationCap,
  HandHeart,
  Handshake,
  HeartPulse,
  Landmark,
  LifeBuoy,
  Newspaper,
  Palette,
  Rocket,
  ShoppingBag,
  Smartphone,
  Sprout,
  Users,
  type LucideProps,
} from "lucide-react";
import type { IconName } from "@/lib/icons";

const MAP: Record<IconName, React.ComponentType<LucideProps>> = {
  code: Code,
  smartphone: Smartphone,
  cloud: Cloud,
  brain: Brain,
  cpu: Cpu,
  palette: Palette,
  compass: Compass,
  "life-buoy": LifeBuoy,
  landmark: Landmark,
  "graduation-cap": GraduationCap,
  banknote: Banknote,
  "heart-pulse": HeartPulse,
  sprout: Sprout,
  "shopping-bag": ShoppingBag,
  "hand-heart": HandHeart,
  "book-open": BookOpen,
  briefcase: Briefcase,
  "badge-check": BadgeCheck,
  users: Users,
  building: Building,
  calendar: Calendar,
  newspaper: Newspaper,
  handshake: Handshake,
  "flask-conical": FlaskConical,
  rocket: Rocket,
};

/** CMS-selectable icon (Lucide, 1.5 px stroke — UI/UX §14.2). */
export function Icon({ name, ...props }: { name?: string | null } & Omit<LucideProps, "name">) {
  const Component = name ? MAP[name as IconName] : undefined;
  if (!Component) return null;
  return <Component aria-hidden strokeWidth={1.5} {...props} />;
}
