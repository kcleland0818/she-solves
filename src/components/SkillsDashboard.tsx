import { useMemo } from "react";
import { Trophy } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import SkillStamp from "./SkillStamp";
import { getCompletedShops } from "@/lib/progress";

interface ShopSkills {
  id: string;
  emoji: string;
  name: string;
  skills: string[];
}

const SHOPS: ShopSkills[] = [
  { id: "smoothie-shop", emoji: "🍓", name: "Berry Bliss Smoothies", skills: ["Ratios", "Percentages", "Discounts"] },
  { id: "bakery", emoji: "🧁", name: "Sweet Crumbs Bakery", skills: ["Identifying Fractions", "Equivalent Fractions", "Comparing Fractions"] },
  { id: "bookstore", emoji: "📚", name: "Page Turner Bookstore", skills: ["Reading Inequalities", "Writing Inequalities", "Comparing With Inequalities"] },
];

const SkillsDashboard = () => {
  const completed = useMemo(() => getCompletedShops(), []);
  const totalSkills = SHOPS.reduce((n, s) => n + s.skills.length, 0);
  const earnedSkills = SHOPS.reduce((n, s) => n + (completed.has(s.id) ? s.skills.length : 0), 0);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="bg-card text-foreground border border-border rounded-full h-12 px-4 flex items-center gap-2 shadow-lg hover:scale-105 transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label={`Open skills dashboard. ${earnedSkills} of ${totalSkills} skills earned.`}
        >
          <Trophy className="w-5 h-5 text-primary" aria-hidden="true" />
          <span className="text-sm font-semibold">
            {earnedSkills}/{totalSkills}
          </span>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" aria-hidden="true" /> Your Skills
          </DialogTitle>
          <DialogDescription>
            {earnedSkills === 0
              ? "Complete a shop to start earning skills!"
              : `You've earned ${earnedSkills} of ${totalSkills} skills so far. Keep going!`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {SHOPS.map((shop) => {
            const earned = completed.has(shop.id);
            return (
              <section key={shop.id} aria-labelledby={`dash-${shop.id}`}>
                <h3
                  id={`dash-${shop.id}`}
                  className="text-sm font-semibold flex items-center gap-2 mb-2"
                >
                  <span aria-hidden="true">{shop.emoji}</span>
                  {shop.name}
                  {earned && (
                    <span className="text-xs font-normal text-primary">· earned</span>
                  )}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {shop.skills.map((skill) =>
                    earned ? (
                      <SkillStamp key={skill} label={skill} />
                    ) : (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-2 rounded-full border-2 border-dashed border-muted-foreground/30 bg-muted/30 px-4 py-1.5 text-sm font-medium text-muted-foreground"
                      >
                        <span aria-hidden="true">🔒</span>
                        {skill}
                      </span>
                    )
                  )}
                </div>
              </section>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SkillsDashboard;
