import Image from "next/image";
import "./style.css";
import {
  HeroCarousel,
  MainHeader,
  LandingPageCategories,
  Features,
} from "@/widgets";
import { ProductCard } from "@/widgets/product-card";
import type { Product } from "@/entities/product";

const exampleProducts: Product[] = [
  {
    id: 1,
    name: "Eco-Friendly Water Bottle",
    slug: "eco-friendly-water-bottle",
    description: "A reusable water bottle made from sustainable materials.",
    short_description: "Reusable, eco-friendly bottle.",
    price: 19.99,
    original_price: 24.99,
    stock: 120,
    sku: "WB-ECO-001",
    weight: 0.3,
    dimensions: "7x7x25",
    is_active: true,
    is_featured: true,
    is_on_sale: true,
    is_new: false,
    image_url: "https://placehold.co/600x400/c1c1c1/FFFFFF/png",
    category_id: 2,
    category_name: "Accessories",
    category_slug: "accessories",
    created_at: "2024-06-01T10:00:00Z",
    updated_at: "2024-06-05T12:00:00Z",
  },
  {
    id: 2,
    name: "Organic Cotton T-Shirt",
    slug: "organic-cotton-t-shirt",
    description: "Soft and comfortable t-shirt made from 100% organic cotton.",
    short_description: "100% organic cotton.",
    price: 29.99,
    original_price: 39.99,
    stock: 75,
    sku: "TS-ORG-002",
    weight: 0.2,
    dimensions: "30x25x2",
    is_active: true,
    is_featured: false,
    is_on_sale: false,
    is_new: true,
    image_url: "https://placehold.co/600x400/c1c1c1/FFFFFF/png",
    category_id: 1,
    category_name: "Clothing",
    category_slug: "clothing",
    created_at: "2024-06-02T09:30:00Z",
    updated_at: "2024-06-06T11:45:00Z",
  },
  {
    id: 3,
    name: "Bamboo Toothbrush",
    slug: "bamboo-toothbrush",
    description: "Biodegradable toothbrush with bamboo handle.",
    short_description: "Eco-friendly bamboo toothbrush.",
    price: 4.99,
    original_price: 6.99,
    stock: 200,
    sku: "TB-BAM-003",
    weight: 0.05,
    dimensions: "18x2x2",
    is_active: true,
    is_featured: false,
    is_on_sale: true,
    is_new: true,
    image_url: "https://placehold.co/600x400/c1c1c1/FFFFFF/png",
    category_id: 3,
    category_name: "Personal Care",
    category_slug: "personal-care",
    created_at: "2024-06-03T08:15:00Z",
    updated_at: "2024-06-07T10:20:00Z",
  },
];

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

          <section id="products-section">
            <h2>Nos Produits</h2>
            <div className="product-grid">
              {exampleProducts.map((e) => {
                return <ProductCard data={e} key={e.id} />;
              })}
            </div>
          </section>
        </div>
      </main>

      <footer> </footer>
    </>
  );
}
