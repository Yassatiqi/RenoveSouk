import { categories } from "@/shared/data";
import "./style.css";
import Link from "next/link";

export const LandingPageCategories = () => {
  return (
    <div id="landing-categories-section" className="container">
      <h2>Choisissez votre catégorie</h2>
      <div className="categories-grid">
        {categories.map((category, index) => {
          return (
            <Link key={index} href={category.href} className="category-item">
              <div className="category-icon">{category.icon}</div>
              <div className="category-label">
                <p>{category.name}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
