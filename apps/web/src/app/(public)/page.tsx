"use client";

import Image from "next/image";
import "./style.css";
import { HeroCarousel, MainHeader, LandingPageCategories } from "@/widgets";

export default function Home() {
  return (
    <>
      <main>
        <section id="hero-section">
          <MainHeader />

          <Image
            alt="Hero Image"
            className="hero-image"
            fill
            src="/svg/hero-bg.svg"
          />

          <HeroCarousel />

          <LandingPageCategories />
        </section>

        <section id="categories-section"> </section>
      </main>

      <footer> </footer>
    </>
  );
}
