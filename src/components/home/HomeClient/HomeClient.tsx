"use client";

import dynamic from "next/dynamic";
import HeroSection from "@/components/home/HeroSection/HeroSection";
import ScrollReveal from "@/components/ui/ScrollReveal/ScrollReveal";

const MenuCategories = dynamic(
  () => import("@/components/home/MenuCategories/MenuCategories"),
  { loading: () => <div style={{ minHeight: '360px' }} /> },
);
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
              <ScrollReveal key={section} animation="fadeUp" as="section">
                <div id="menu">
                  <MenuCategories categories={menuCategories} />
                </div>
              </ScrollReveal>
            );

          case "daily-specials":
            return (
              <ScrollReveal key={section} animation="fadeUp" delay={100} as="section">
                <div id="specials">
                  <DailySpecials items={dailySpecials} />
                </div>
              </ScrollReveal>
            );

          case "trust-strip":
            return (
              <ScrollReveal key={section} animation="fadeIn" as="section">
                <div id="contacts">
                  <TrustStrip />
                </div>
              </ScrollReveal>
            );

          case "reservations":
            return (
              <ScrollReveal key={section} animation="fadeUp" as="section">
                <div id="reservations">
                  <ReservationSection />
                </div>
              </ScrollReveal>
            );

          case "gallery":
            return (
              <ScrollReveal key={section} animation="scaleIn" as="section">
                <div id="gallery">
                  <GallerySection />
                </div>
              </ScrollReveal>
            );

          case "about":
            return (
              <ScrollReveal key={section} animation="fadeUp" delay={100} as="section">
                <div id="about">
                  <AboutSection />
                </div>
              </ScrollReveal>
            );

          case "testimonials":
            return (
              <ScrollReveal key={section} animation="fadeUp" as="section">
                <TestimonialsSection
                  testimonials={testimonials ?? []}
                  totalCount={testimonialsCount ?? 0}
                />
              </ScrollReveal>
            );

          default:
            return null;
        }
      })}
    </>
  );
}
