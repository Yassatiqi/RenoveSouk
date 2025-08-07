import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import "./style.css";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

interface FeatureCardProps {
  title: string;
  description: string;
  buttonText: string;
  image: string;
  className?: string;
}

function FeatureCard({
  title,
  description,
  buttonText,
  image,
  className,
}: FeatureCardProps) {
  return (
    <Card className={cn(className)} id="features-card">
      <div className="background">
        <Image src={image} alt={title} fill objectFit="cover" />
        <div className="content">
          <Badge variant="outline" className="badge">
            UP TO 20% SOLDE
          </Badge>

          <h3 className="title">{title}</h3>

          <p className="description">{description}</p>

          <Button asChild>
            <Link href="#">{buttonText}</Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}

const features: FeatureCardProps[] = [
  {
    title: "Outillage & Machines",
    description:
      "Des outils électroportatifs, outils à main et machines robustes pour une performance professionnelle au quotidien.",
    buttonText: "Acheter maintenant",
    image: "/images/feature-1.png",
    className: "features-grid__item--tools",
  },
  {
    title: "Plomberie & Sanitaire",
    description:
      "Tuyaux, raccords, lavabos et plus encore – pour une maison fonctionnelle et moderne.",
    buttonText: "Voir les produits",
    image: "/images/feature-2.png",
    className: "features-grid__item--plumbing",
  },
  {
    title: "Peinture & Revêtements",
    description:
      "Peintures intérieures/extérieures, revêtements muraux et sols – transformez votre espace en beauté.",
    buttonText: "Voir les produits",
    image: "/images/feature-3.png",
    className: "features-grid__item--paint",
  },
];

export function Features() {
  return (
    <div id="features-grid">
      {features.map((feature, index) => (
        <FeatureCard
          key={index}
          title={feature.title}
          description={feature.description}
          buttonText={feature.buttonText}
          image={feature.image}
          className={feature.className}
        />
      ))}
    </div>
  );
}
