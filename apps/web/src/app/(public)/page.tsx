import Image from "next/image";
import "./style.css";
import {
  HeroCarousel,
  MainHeader,
  LandingPageCategories,
  Features,
  OurProducts,
  NewsLetter,
  Footer,
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
        </section>

        <div className="container" id="sections-container">
          <section id="categories-section">
            <LandingPageCategories />
          </section>

          <section id="features-section">
            <Features />
          </section>

          <section id="products-section">
            <OurProducts />
          </section>

          <section id="newsletter-section">
            <NewsLetter />
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}
