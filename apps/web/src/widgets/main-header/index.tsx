"use client";

import "./style.css";
import {
  Mail,
  MapPin,
  Menu,
  Phone,
  Search,
  ShoppingCart,
  User,
} from "lucide-react";
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
import { navLinks } from "./data";
import { Badge } from "@/components/ui/badge";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { categories } from "@/shared/data";

export const MainHeader = () => {
  const [open, setOpen] = useState(false);

  const handleClickSearch = () => {
    setOpen(true);
  };

  return (
    <>
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
          <MainLogo className="logo" />

          {/* Navigation */}
          <NavigationMenu className="navigation-menu">
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

          {/* Search Bar */}
          <button
            className="search-bar"
            type="button"
            aria-label="Ouvrir la recherche"
          >
            <Search size={18} strokeWidth={1.5} aria-hidden="true" />

            <Input
              placeholder="Cherchez sur renovsouk..."
              type="text"
              readOnly
              onClick={handleClickSearch}
              tabIndex={-1}
              aria-hidden="true"
            />
          </button>

          {/* Right Section */}
          <div className="right-section">
            <div className="-web">
              {/* Action Icons */}
              <div className="nav-actions">
                <Search
                  size={24}
                  onClick={handleClickSearch}
                  className="search-icon"
                />
                <User size={24} className="user-icon" />
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

            <div className="-mobile">
              <Sheet>
                <SheetTrigger asChild>
                  <button type="button" className="menu-button">
                    <Menu size={24} strokeWidth={1.5} />
                  </button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>
                      <MainLogo />
                    </SheetTitle>

                    <div id="mobile-navigation-container">
                      <div className="navigation-section">
                        <h3>Nos catégories</h3>
                        <NavigationMenu orientation="vertical">
                          <NavigationMenuList className="navigation-menu">
                            {categories.map((cat) => (
                              <NavigationMenuItem key={cat.href}>
                                <NavigationMenuLink asChild>
                                  <Link
                                    href={cat.href}
                                    className="categories-link"
                                  >
                                    {cat.icon} {cat.name}
                                  </Link>
                                </NavigationMenuLink>
                              </NavigationMenuItem>
                            ))}
                          </NavigationMenuList>
                        </NavigationMenu>
                      </div>

                      <div className="navigation-section">
                        <h3>Pages</h3>
                        <NavigationMenu orientation="vertical">
                          <NavigationMenuList className="navigation-menu">
                            {navLinks.map((p) => (
                              <NavigationMenuItem key={p.href}>
                                <NavigationMenuLink
                                  asChild
                                  className="categories-link"
                                >
                                  <Link href={p.href}>{p.name}</Link>
                                </NavigationMenuLink>
                              </NavigationMenuItem>
                            ))}
                          </NavigationMenuList>
                        </NavigationMenu>
                      </div>
                    </div>
                  </SheetHeader>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Products">
            <CommandItem>Product 1</CommandItem>
            <CommandItem>Product 2</CommandItem>
            <CommandItem>Product 3</CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
};
