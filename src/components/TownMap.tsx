import { useState, useMemo } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Lock } from "lucide-react";
import townMapBg from "@/assets/town-map-bg.jpg";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Shop {
  id: string;
  name: string;
  emoji: string;
  description: string;
  learningTopics: string[];
  unlocked: boolean;
  position: { top: string; left: string };
  positionMd?: { top: string; left: string };
}

const shops: Shop[] = [
  {
    id: "smoothie-shop",
    name: "Berry Bliss Smoothie Shop",
    emoji: "🍓",
    description:
      "You just became the owner of the coolest smoothie shop in town! Learn the math behind mixing drinks, tracking sales, and running discounts.",
    learningTopics: ["Ratios & Proportions", "Percentages", "Discounts & Mental Math"],
    unlocked: true,
    position: { top: "63%", left: "50%" },
  },
  {
    id: "bakery",
    name: "Sweet Crumbs Bakery",
    emoji: "🧁",
    description: "Coming soon!",
    learningTopics: ["Fractions", "Measurement", "Unit Conversion"],
    unlocked: false,
    position: { top: "62%", left: "72%" },
    positionMd: { top: "62%", left: "60%" },
  },
];

interface TownMapProps {
  onEnterShop: (shopId: string) => void;
}

const TownMap = ({ onEnterShop }: TownMapProps) => {
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const isMobile = useIsMobile();

  const getPosition = (shop: Shop) => {
    if (!isMobile && shop.positionMd) return shop.positionMd;
    return shop.position;
  };

  return (
    <div
      className="h-[100dvh] flex flex-col relative overflow-hidden"
      style={{
        background: "linear-gradient(to bottom, hsl(200, 60%, 92%), hsl(200, 40%, 96%))",
      }}
    >
      {/* Header */}
      <div className="text-center pt-3 pb-1 md:pt-4 md:pb-2 z-10 relative shrink-0">
        <h1 className="text-2xl md:text-4xl font-extrabold text-foreground drop-shadow-sm">
          📍 Mathville
        </h1>
        <p className="text-muted-foreground text-xs md:text-base mt-0.5">
          Tap a shop to start learning! ✨
        </p>
      </div>

      {/* Map fills remaining space */}
      <div className="relative flex-1 min-h-0 w-full flex items-start md:items-center justify-center p-2 md:p-4">
        <div className="relative w-full max-w-5xl overflow-hidden rounded-xl md:rounded-2xl shadow-xl border-2 md:border-4 border-white/60 aspect-[4/3] md:aspect-video">
          <img
            src={townMapBg}
            alt="Mathville town map"
            className="absolute inset-0 w-full h-full object-cover object-[50%_80%] md:object-[50%_85%]"
            width={1920}
            height={1080}
          />

          {/* Clickable shop markers */}
          {shops.map((shop) => (
            <button
              key={shop.id}
              onClick={() => setSelectedShop(shop)}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 z-10 ${
                shop.unlocked
                  ? "hover:scale-110 cursor-pointer"
                  : "cursor-pointer opacity-70"
              }`}
              style={{ top: getPosition(shop).top, left: getPosition(shop).left }}
              aria-label={`${shop.name}${shop.unlocked ? "" : " (locked)"}`}
            >
              <div
                className={`relative flex flex-col items-center ${
                  shop.unlocked ? "animate-[bounce_3s_ease-in-out_infinite]" : ""
                }`}
              >
                <div
                  className={`w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center text-lg md:text-2xl shadow-lg border-2 border-white/80 ${
                    shop.unlocked
                      ? "bg-white ring-2 ring-primary/40"
                      : "bg-muted/80 grayscale"
                  }`}
                >
                  {shop.unlocked ? (
                    shop.emoji
                  ) : (
                    <Lock className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
                  )}
                </div>
                <span
                  className={`mt-1 text-[10px] md:text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap shadow-sm ${
                    shop.unlocked
                      ? "bg-white/90 text-foreground"
                      : "bg-muted/70 text-muted-foreground"
                  }`}
                >
                  {shop.name.split(" ").slice(0, 2).join(" ")}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Shop Detail Modal */}
      <Dialog
        open={selectedShop !== null}
        onOpenChange={(open) => !open && setSelectedShop(null)}
      >
        <DialogContent className="sm:max-w-md rounded-2xl">
          {selectedShop && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl flex items-center gap-2">
                  <span className="text-2xl">{selectedShop.emoji}</span>
                  {selectedShop.name}
                  {!selectedShop.unlocked && (
                    <Lock className="w-4 h-4 text-muted-foreground" />
                  )}
                </DialogTitle>
                <DialogDescription className="text-base pt-2">
                  {selectedShop.description}
                </DialogDescription>
              </DialogHeader>

              <div className="mt-2">
                <p className="text-sm font-semibold text-foreground mb-2">
                  {selectedShop.unlocked ? "What you'll learn:" : "Topics (coming soon):"}
                </p>
                <ul className="space-y-1">
                  {selectedShop.learningTopics.map((topic) => (
                    <li
                      key={topic}
                      className="text-sm text-muted-foreground flex items-center gap-2"
                    >
                      <span className="text-primary">✦</span> {topic}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setSelectedShop(null)}
                >
                  Back to Map
                </Button>
                {selectedShop.unlocked ? (
                  <Button onClick={() => onEnterShop(selectedShop.id)}>
                    Enter Shop 🚀
                  </Button>
                ) : (
                  <Button disabled className="opacity-50">
                    🔒 Coming Soon
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TownMap;
