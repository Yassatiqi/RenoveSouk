"use client";

import Image from "next/image";
import "./style.css";
import {
  HeroCarousel,
  MainHeader,
  LandingPageCategories,
  Features,
} from "@/widgets";

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

        <div className="container" id="sections-container">
          <section id="features-section">
            <Features />
          </section>
        </div>
      </main>

      <footer> </footer>
    </>
  );
}
