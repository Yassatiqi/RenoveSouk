import "./style.css";
import { Mail, MapPin, Phone, Search, ShoppingCart, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { MainLogo } from "@/components/logo";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Separator } from "@/components/ui/separator";
import { categories, navLinks } from "./data";
import { Badge } from "@/components/ui/badge";

export const MainHeader = () => {
  return (
    <header id="main-header">
      {/* top section */}
      <div className="top-section">
        {/* hello */}
        <div>
          <MapPin size={16} />
          <p>Bienvenue sur RenovSouk - Livraison dans tout le Maroc</p>
        </div>

        {/* details */}
        <div>
          <div>
            <Mail size={16} />
            <p>contact@renovsouk.com</p>
          </div>

          <Separator orientation="vertical" />

          <div>
            <Phone size={16} />
            <p>+212 6 1234 5678</p>
          </div>

          <Separator orientation="vertical" />

          <div>
            <div className="flag">
              <Image alt="France flag" fill src="/svg/france.svg" />
            </div>
            <p>Français</p>
          </div>

          <Separator orientation="vertical" />

          <div>
            <div className="flag">
              <Image alt="Morocco flag" fill src="/svg/morocco.svg" />
            </div>
            <p>العربية</p>
          </div>
        </div>
      </div>

      {/* bottom section */}
      <div className="bottom-section">
        <MainLogo />

        {/* Navigation */}
        <NavigationMenu>
          <NavigationMenuList>
            {/* Categories Dropdown */}
            <NavigationMenuItem>
              <NavigationMenuTrigger className="categories-trigger">
                Toutes Catégories
              </NavigationMenuTrigger>

              <NavigationMenuContent>
                {categories.map((cat) => (
                  <NavigationMenuLink
                    asChild
                    className="categories-link"
                    key={cat.href}
                  >
                    <Link href={cat.href}>{cat.name}</Link>
                  </NavigationMenuLink>
                ))}
              </NavigationMenuContent>
            </NavigationMenuItem>

            {/* Simple Navigation Links */}
            {navLinks.map((link) => (
              <NavigationMenuItem key={link.href}>
                <NavigationMenuLink className="nav-link" href={link.href}>
                  {link.name}
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        <div className="right-section">
          {/* Action Icons */}
          <div className="nav-actions">
            <Search size={24} />
            <div className="cart-wrapper">
              <ShoppingCart size={24} />
              <Badge className="cart-badge" variant="default">
                +8
              </Badge>
            </div>
          </div>

          {/* user sessions*/}
          <Link className="user-session" href={"/login"}>
            <div className="icon">
              <User size={24} />
            </div>
            <span>Se connecter</span>
          </Link>
        </div>
      </div>
    </header>
  );
};
