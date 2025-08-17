"use client";

import "./style.css";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Product } from "@/entities/product";
import { cn } from "@/lib/utils";
import { Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { useState, type ComponentProps, type FC } from "react";

type Props = ComponentProps<"article"> & { data: Product };

export const ProductCard: FC<Props> = ({ data, ...props }) => {
  const [isWishlist, setIsWishlist] = useState(false);

  const toggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsWishlist(!isWishlist);
  };

  const addToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
  };

  return (
    <article className="product-card" {...props}>
      <Link href={`/products/${data.slug}`} className="product-card-link">
        <div className="-image">
          {data.image_url ? (
            <Image
              src={`${process.env.NEXT_PUBLIC_API_URL}${data.image_url}`}
              alt={data.name}
              fill
            />
          ) : (
            <div className="placeholder-image" />
          )}
        </div>
        {/* details */}
        <section>
          <div className="-details">
            <Badge variant="outline" className="category">
              {data.category_name}
            </Badge>
            <h5 className="title">{data.name}</h5>
          </div>

          <div className="-price">
            <p>{data.price} DH</p>
            {data.original_price && <span>{data.original_price} DH</span>}
          </div>

          <div className="-actions">
            <Button onClick={addToCart}>Ajouter au panier</Button>
            <Button
              size={"icon"}
              className={cn("wishlist-button", {
                "is-wishlist": isWishlist,
              })}
              onClick={toggleWishlist}
            >
              <Heart />
            </Button>
          </div>
        </section>
      </Link>
    </article>
  );
};
