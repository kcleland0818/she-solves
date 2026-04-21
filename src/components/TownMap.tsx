import { useState, useMemo } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Lock, Check } from "lucide-react";
import townMapBg from "@/assets/town-map-bg.jpg";
import { getCompletedShops, resetProgress } from "@/lib/progress";
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
    description:
      "Step into the bakery! Slice cakes, frost cupcake trays, and figure out which dessert is bigger — all while learning fractions.",
    learningTopics: ["Identifying Fractions", "Equivalent Fractions", "Comparing Fractions"],
    unlocked: true,
    position: { top: "62%", left: "72%" },
    positionMd: { top: "62%", left: "62%" },
  },
  {
    id: "bookstore",
    name: "Page Turner Bookstore",
    emoji: "📚",
    description:
      "A cozy bookstore is opening soon! Get ready to learn about money, change, and budgeting while helping customers find their next favorite read.",
    learningTopics: ["Money & Change", "Budgeting", "Word Problems"],
    unlocked: false,
    position: { top: "52%", left: "32%" },
    positionMd: { top: "55%", left: "42%" },
  },
];

interface TownMapProps {
  onEnterShop: (shopId: string) => void;
}

const TownMap = ({ onEnterShop }: TownMapProps) => {
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const isMobile = useIsMobile();
  // Read once on mount; selection/dialog cycles will re-render but completion
  // only changes when returning from a shop, which remounts this component.
  const completedShops = useMemo(() => getCompletedShops(), []);

  const getPosition = (shop: Shop) => {
    if (!isMobile && shop.positionMd) return shop.positionMd;
    return shop.position;
  };

  return (
    <main
      className="h-[100dvh] flex flex-col relative overflow-hidden"
      style={{
        background: "linear-gradient(to bottom, hsl(200, 60%, 92%), hsl(200, 40%, 96%))",
      }}
    >
      {/* Skip link for keyboard users */}
      <a
        href="#shop-markers"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-md"
      >
        Skip to shops
      </a>

      {/* Header */}
      <div className="text-center pt-3 pb-1 md:pt-4 md:pb-2 z-10 relative shrink-0">
        <h1 className="text-2xl md:text-4xl font-extrabold text-foreground drop-shadow-sm">
          <span aria-hidden="true">📍 </span>SheSolves City
        </h1>
        <p className="text-muted-foreground text-xs md:text-base mt-0.5">
          Tap a shop to start solving!
        </p>
      </div>

      {/* Map fills remaining space */}
      <div className="relative flex-1 min-h-0 w-full flex items-center justify-center p-1 md:p-2">
        <div
          className="relative w-full h-full overflow-hidden rounded-xl md:rounded-2xl shadow-xl border-2 md:border-4 border-white/60 bg-center bg-no-repeat bg-cover"
          style={{ backgroundImage: `url(${townMapBg})` }}
        >
          {/* Decorative background description for screen readers (sibling, not ancestor of buttons) */}
          <span className="sr-only">Town map of SheSolves City with shops to explore.</span>
          {/* Clickable shop markers */}
          <nav id="shop-markers" aria-label="Shop locations">
            {shops.map((shop) => {
              const isCompleted = completedShops.has(shop.id);
              return (
                <button
                  key={shop.id}
                  onClick={() => setSelectedShop(shop)}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 z-10 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-full ${
                    shop.unlocked
                      ? "hover:scale-110 cursor-pointer"
                      : "cursor-pointer opacity-70"
                  }`}
                  style={{ top: getPosition(shop).top, left: getPosition(shop).left }}
                  aria-label={`${shop.name}${shop.unlocked ? "" : " — locked, coming soon"}${isCompleted ? " — completed" : ""}`}
                >
                  <div
                    className={`relative flex flex-col items-center ${
                      shop.unlocked ? "animate-[bounce_3s_ease-in-out_infinite]" : ""
                    }`}
                  >
                    <div
                      className={`relative w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center text-lg md:text-2xl shadow-lg border-2 border-white/80 ${
                        shop.unlocked
                          ? "bg-white ring-2 ring-primary/40"
                          : "bg-muted/80 grayscale"
                      }`}
                      aria-hidden="true"
                    >
                      {shop.unlocked ? (
                        shop.emoji
                      ) : (
                        <Lock className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
                      )}
                      {isCompleted && (
                        <span
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 md:w-6 md:h-6 rounded-full bg-[hsl(45,95%,55%)] border-2 border-white shadow-md flex items-center justify-center"
                          aria-hidden="true"
                        >
                          <Check className="w-3 h-3 md:w-3.5 md:h-3.5 text-white" strokeWidth={3} />
                        </span>
                      )}
                    </div>
                    <span
                      className={`mt-1 text-[10px] md:text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap shadow-sm ${
                        shop.unlocked
                          ? "bg-white/90 text-foreground"
                          : "bg-muted/70 text-muted-foreground"
                      }`}
                      aria-hidden="true"
                    >
                      {shop.name.split(" ").slice(0, 2).join(" ")}
                    </span>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Dev/testing utility: reset all shop completion */}
      {completedShops.size > 0 && (
        <div className="absolute bottom-1 right-2 z-20">
          <button
            type="button"
            onClick={() => {
              resetProgress();
              window.location.reload();
            }}
            className="text-[10px] md:text-xs text-muted-foreground/70 hover:text-foreground underline underline-offset-2 px-2 py-1 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Reset all shop progress"
          >
            Reset progress
          </button>
        </div>
      )}

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
                  <span className="text-2xl" aria-hidden="true">{selectedShop.emoji}</span>
                  {selectedShop.name}
                  {!selectedShop.unlocked && (
                    <>
                      <Lock className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                      <span className="sr-only">(locked)</span>
                    </>
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
                <ul className="space-y-1" aria-label="Learning topics">
                  {selectedShop.learningTopics.map((topic) => (
                    <li
                      key={topic}
                      className="text-sm text-muted-foreground flex items-center gap-2"
                    >
                      <span className="text-primary" aria-hidden="true">✦</span> {topic}
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
                    {completedShops.has(selectedShop.id) ? "Revisit Shop" : "Enter Shop"}{" "}
                    <span aria-hidden="true">🚀</span>
                  </Button>
                ) : (
                  <Button disabled aria-disabled="true" className="opacity-50">
                    <span aria-hidden="true">🔒</span> Coming Soon
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default TownMap;
