"use client";
import * as React from "react";
import Image from "next/image";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

export function HeroCarousel() {
  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: false })
  );

  const images = [
    "/home/recap-foto.webp",
    "/about/jersey-medal.webp",
  ];

  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    const onSelect = () => setCurrent(api.selectedScrollSnap());

    api.on("select", onSelect);
    api.on("reInit", onSelect);

    return () => {
      api.off("select", onSelect);
      api.off("reInit", onSelect);
    };
  }, [api]);

  const scrollTo = React.useCallback(
    (index: number) => api?.scrollTo(index),
    [api]
  );

  return (
    <Carousel
      setApi={setApi}
      className="w-full"
      plugins={[plugin.current]}
      onMouseEnter={plugin.current.stop}
      onMouseLeave={plugin.current.reset}
    >
      <CarouselContent>
        {images.map((imageUrl, index) => (
          <CarouselItem key={index} className="p-0">
            {/*
              Mobile  : semua slide pakai tinggi yang sama (aspect-video ≈ rasio foto utama).
                        Background putih + object-contain → foto di-center,
                        sisa ruang kosong jadi putih (bukan hitam).
              Desktop : h-[70vh] fixed + object-cover, tampilan sinematik.
            */}
            <div className="relative w-full aspect-video bg-white sm:aspect-auto sm:h-[70vh] sm:bg-transparent">
              <Image
                src={imageUrl}
                alt={`Enthusiast Run slide ${index + 1}`}
                fill
                priority={index === 0}
                draggable={false}
                sizes="100vw"
                className="object-contain sm:object-cover"
              />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />

      <div className="absolute bottom-6 left-0 right-0 z-10 flex items-center justify-center gap-2">
        {Array.from({ length: count }).map((_, index) => (
          <button
            key={index}
            aria-label={`Go to slide ${index + 1}`}
            onClick={() => scrollTo(index)}
            className={cn(
              "h-2 w-2 rounded-full transition-all duration-300",
              current === index
                ? "w-4 bg-white"
                : "bg-white/50 hover:bg-white/75"
            )}
          />
        ))}
      </div>
    </Carousel>
  );
}