interface SkillStampProps {
  label: string;
}

// Celebratory chip shown between scenes when the learner masters a skill.
// Honors prefers-reduced-motion via the global `motion-reduce:` variants.
const SkillStamp = ({ label }: SkillStampProps) => (
  <div
    role="status"
    aria-live="polite"
    className="mx-auto inline-flex items-center gap-2 rounded-full border-2 border-primary/40 bg-primary/10 px-4 py-1.5 text-sm font-semibold text-foreground animate-fade-in motion-reduce:animate-none"
  >
    <span aria-hidden="true">✨</span>
    <span>
      Skill unlocked: <span className="text-primary">{label}</span>
    </span>
  </div>
);

export default SkillStamp;
