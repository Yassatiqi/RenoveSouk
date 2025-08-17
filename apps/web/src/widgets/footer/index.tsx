import "./style.css";
import Link from "next/link";
import { Phone, Mail, Facebook, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MainLogo } from "@/components/logo";

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <MainLogo />

        <p className="footer-tagline">
          Votre partenaire de confiance pour tous vos projets de rénovation et
          de construction.
        </p>
      </div>

      <Separator className="footer-separator" />

      <div className="footer-middle">
        <div className="footer-sections">
          <div className="footer-section">
            <h3>Catégories</h3>
            <ul>
              <li>
                <Link href="/">Outillage & Machines</Link>
              </li>
              <li>
                <Link href="/">Matériaux Construction</Link>
              </li>
              <li>
                <Link href="/">Électricité & Éclairage</Link>
              </li>
              <li>
                <Link href="/">Plomberie & Sanitaire</Link>
              </li>
              <li>
                <Link href="/">Décoration</Link>
              </li>
            </ul>
          </div>

          <div className="footer-section">
            <h3>Service Client</h3>
            <ul>
              <li>
                <Link href="/">Contact</Link>
              </li>
              <li>
                <Link href="/">Livraison</Link>
              </li>
              <li>
                <Link href="/">Retours</Link>
              </li>
              <li>
                <Link href="/">FAQ</Link>
              </li>
              <li>
                <Link href="/">Garantie</Link>
              </li>
            </ul>
          </div>

          <div className="footer-section contact-section">
            <h3>Contact</h3>
            <ul>
              <li className="contact-item">
                <Button variant="link" size="sm" asChild>
                  <a href="tel:+21265466432">
                    <Phone size={18} />
                  </a>
                </Button>
                <span>+212 65466432</span>
              </li>
              <li className="contact-item">
                <Button variant="link" size="sm" asChild>
                  <a href="mailto:email@email.com">
                    <Mail size={18} />
                  </a>
                </Button>
                <span>email@email.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-social">
          <Button variant="link" size="icon" asChild>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Facebook size={24} />
            </a>
          </Button>
          <Button variant="link" size="icon" asChild>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Instagram size={24} />
            </a>
          </Button>
        </div>
      </div>

      <Separator className="footer-separator" />

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} RenovSouk. Tous droits réservés.</p>
        <div className="footer-bottom-links">
          <Link href="/conditions">Conditions d&apos;utilisation</Link>
          <span> | </span>
          <Link href="/privacy">Politique de confidentialité</Link>
        </div>
      </div>
    </footer>
  );
}
