import { fetcher } from "@/shared/api";
import type { ProductTabs } from "@/widgets/landing-page/our-products";
import useSWR from "swr";
import type { Product } from "../model/types";

const swrOptions = {
  revalidateIfStale: false,
  dedupingInterval: 5 * 60 * 1000,
};

export const useFetchLandingPageProducts = (tab: ProductTabs) => {
  const endpoint: Record<ProductTabs, string> = {
    featured: "/products/featured",
    new: "/products/new",
    onSale: "/products/sale",
  };

  return useSWR<Product[]>(endpoint[tab], fetcher, swrOptions);
};
