"use client";

import dynamic from "next/dynamic";
import HeroSection from "@/components/home/HeroSection/HeroSection";
import MenuCategories from "@/components/home/MenuCategories/MenuCategories";

const DailySpecials = dynamic(
  () => import("@/components/home/DailySpecials/DailySpecials"),
);
const ReservationSection = dynamic(
  () => import("@/components/home/ReservationSection/ReservationSection"),
);
const GallerySection = dynamic(
  () => import("@/components/home/GallerySection/GallerySection"),
);
const AboutSection = dynamic(
  () => import("@/components/home/AboutSection/AboutSection"),
);
const TrustStrip = dynamic(
  () => import("@/components/home/TrustStrip/TrustStrip"),
);
const TestimonialsSection = dynamic(
  () => import("@/components/home/TestimonialsSection/TestimonialsSection"),
);
import type { TestimonialItem } from "@/components/home/TestimonialsSection/TestimonialsSection";
import { useVerticalConfig } from "@/lib/vertical-context";
import type { ProductCardProps } from "@/components/catalog/ProductCard/ProductCard";

export type ProductData = Omit<
  ProductCardProps,
  "onAddToCart" | "onCompare" | "onFavorite"
>;

interface MenuCategoryItem {
  slug: string;
  nameKey: string;
  image?: string;
  productCount: number;
}

interface DailySpecialItem {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  image?: string;
  badge?: "chef" | "popular" | "new";
}

interface HomeClientProps {
  products: ProductData[];
  storeName: string;
  menuCategories?: MenuCategoryItem[];
  dailySpecials?: DailySpecialItem[];
  testimonials?: TestimonialItem[];
  testimonialsCount?: number;
  heroImageMobile?: string;
}

const noop = (_id: string) => {};

export default function HomeClient({
  products,
  storeName,
  menuCategories,
  dailySpecials,
  testimonials,
  testimonialsCount,
  heroImageMobile,
}: HomeClientProps) {
  const vConfig = useVerticalConfig();
  const sections = vConfig.ui.homeSections;

  const fullProducts: ProductCardProps[] = products.map((p) => ({
    ...p,
    onAddToCart: noop,
    onCompare: noop,
    onFavorite: noop,
  }));

  return (
    <>
      {sections.map((section) => {
        switch (section) {
          case "hero":
            return (
              <HeroSection
                key={section}
                storeName={storeName}
                heroImage="/hero-emmerka.webp"
                heroImageMobile={heroImageMobile}
                dailySpecial={
                  fullProducts[0]
                    ? {
                        name: fullProducts[0].name,
                        price: fullProducts[0].price,
                        currency: fullProducts[0].currency ?? "€",
                      }
                    : undefined
                }
              />
            );

          case "menu-categories":
            return (
              <section key={section} id="menu">
                <MenuCategories categories={menuCategories} />
              </section>
            );

          case "daily-specials":
            return (
              <section key={section} id="specials">
                <DailySpecials items={dailySpecials} />
              </section>
            );

          case "trust-strip":
            return (
              <section key={section} id="contacts">
                <TrustStrip />
              </section>
            );

          case "reservations":
            return (
              <section key={section} id="reservations">
                <ReservationSection />
              </section>
            );

          case "gallery":
            return (
              <section key={section} id="gallery">
                <GallerySection />
              </section>
            );

          case "about":
            return (
              <section key={section} id="about">
                <AboutSection />
              </section>
            );

          case "testimonials":
            return (
              <TestimonialsSection
                key={section}
                testimonials={testimonials ?? []}
                totalCount={testimonialsCount ?? 0}
              />
            );

          default:
            return null;
        }
      })}
    </>
  );
}
