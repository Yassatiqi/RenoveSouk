"use client";

import { ProductCard } from "@/widgets";
import "./style.css";
import { useFetchLandingPageProducts } from "@/entities/product";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { useState } from "react";
import { useMediaQuery } from "usehooks-ts";

export type ProductTabs = "featured" | "new" | "onSale";

export const OurProducts = () => {
  const [selectedTab, setSelectedTab] = useState<ProductTabs>("featured");
  const { data } = useFetchLandingPageProducts(selectedTab);
  const isMobile = useMediaQuery("(max-width: 640px)");

  const handleTabChange = (value: string) => {
    const tabValue = value as ProductTabs;
    setSelectedTab(tabValue);
  };

  return (
    <div id="our-products">
      <h2>Nos Produits</h2>

      <Tabs
        defaultValue={selectedTab}
        onValueChange={handleTabChange}
        className="product-tabs-container"
      >
        <TabsList>
          <TabsTrigger value="featured">En Vedette</TabsTrigger>
          <TabsTrigger value="new">Nouveaux</TabsTrigger>
          <TabsTrigger value="onSale">En Promotion</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="product-tabs-content">
          {isMobile ? (
            <Carousel className="product-carousel">
              <CarouselContent className="product-carousel-content">
                {data?.map((e) => (
                  <CarouselItem key={e.id} className="item">
                    <ProductCard data={e} />
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          ) : (
            <div className="product-grid">
              {data?.map((e) => {
                return <ProductCard data={e} key={e.id} />;
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
