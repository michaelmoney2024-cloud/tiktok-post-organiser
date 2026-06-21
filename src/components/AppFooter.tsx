interface AppFooterProps {
  note?: string;
}

export function AppFooter({ note }: AppFooterProps) {
  return (
    <footer className="mt-12 space-y-2 text-center text-xs text-white/30">
      {note && <p>{note}</p>}
      <p>
        produced by{" "}
        <span className="font-medium text-white/50">Sh3llbruthus</span>
      </p>
    </footer>
  );
}
