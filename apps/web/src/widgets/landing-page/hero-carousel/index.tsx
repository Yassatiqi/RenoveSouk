"use client";
import Link from "next/link";
import { content } from "./data";
import "./style.css";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Autoplay from "embla-carousel-autoplay";

export const HeroCarousel = () => {
  return (
    <Carousel
      id="hero-carousel"
      plugins={[
        Autoplay({
          delay: 3000,
        }),
      ]}
      opts={{
        align: "center",
      }}
    >
      <CarouselContent className="container">
        {content.map((e) => (
          <CarouselItem key={e.title}>
            <div id="hero-carousel-item">
              <div className="details">
                <h2>{e.title}</h2>
                <p>{e.description}</p>
                <Button
                  asChild
                  variant="default"
                  size="lg"
                  className="view-button"
                >
                  <Link href={e.href}>Voir maintenant</Link>
                </Button>
              </div>

              <div className="image-container">
                <Image src={e.image} alt={e.title} fill />
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
};
