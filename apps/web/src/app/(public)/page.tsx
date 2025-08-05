'use client';

import Image from 'next/image';
import './style.css';
import { MainHeader } from '@/widgets';

export default function Home() {
  return (
    <>
      <MainHeader />

      <main>
        <section id="hero-section">
          <Image
            alt="Hero Image"
            className="hero-image"
            fill
            src="/svg/hero-bg.svg"
          />
        </section>

        <section id="categories-section"> </section>
      </main>

      <footer> </footer>
    </>
  );
}
