"use client";

interface ToolCardProps {
  emoji: string;
  title: string;
  description: string;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export function ToolCard({
  emoji,
  title,
  description,
  selected,
  onClick,
  disabled,
}: ToolCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`group relative overflow-hidden rounded-xl border p-4 text-left transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${
        selected
          ? "border-[#25f4ee]/50 bg-gradient-to-br from-[#25f4ee]/10 to-[#fe2c55]/5 shadow-lg shadow-[#25f4ee]/10"
          : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.07]"
      }`}
    >
      {selected && (
        <div className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#25f4ee] shadow-[0_0_8px_#25f4ee]" />
      )}
      <span className="mb-3 block text-2xl">{emoji}</span>
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      <p className="mt-1 text-xs leading-relaxed text-white/50">{description}</p>
    </button>
  );
}
