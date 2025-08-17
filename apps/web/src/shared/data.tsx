import {
  Building,
  Drill,
  Droplets,
  Fence,
  PaintRoller,
  Zap,
} from "lucide-react";

export const categories = [
  {
    name: "Matériaux de Construction",
    href: "/categories/materiaux",
    icon: <Building />,
  },
  {
    name: "Outils et Équipements",
    href: "/categories/outils",
    icon: <Drill />,
  },
  { name: "Plomberie", href: "/categories/plomberie", icon: <Droplets /> },
  { name: "Électricité", href: "/categories/electricite", icon: <Zap /> },
  {
    name: "Peinture et Décoration",
    href: "/categories/peinture",
    icon: <PaintRoller />,
  },
  { name: "Jardinage", href: "/categories/jardinage", icon: <Fence /> },
];
