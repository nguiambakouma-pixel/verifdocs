import { ShieldCheck, FileCheck2, ScanLine, CheckCircle2 } from 'lucide-react';

export function HeroIllustration() {
  return (
    <div className="relative mx-auto w-full max-w-md animate-fade-in-scale">
      {/* Floating verification badge */}
      <div className="absolute -right-2 top-8 z-20 flex animate-float items-center gap-2 rounded-xl border border-border bg-card p-3 shadow-lg sm:-right-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-success/10 text-success">
          <CheckCircle2 className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-semibold text-foreground">Vérifié</p>
          <p className="text-[10px] text-muted-foreground">Authentique</p>
        </div>
      </div>

      {/* Floating scan badge */}
      <div
        className="absolute -left-2 bottom-16 z-20 flex animate-float items-center gap-2 rounded-xl border border-border bg-card p-3 shadow-lg sm:-left-6"
        style={{ animationDelay: '1.2s' }}
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <ScanLine className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-semibold text-foreground">QR scanné</p>
          <p className="text-[10px] text-muted-foreground">ID unique</p>
        </div>
      </div>

      {/* Main card: secure document */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCheck2 className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold text-foreground">
              Document officiel
            </span>
          </div>
          <ShieldCheck className="h-5 w-5 text-success" />
        </div>

        <div className="mt-5 space-y-3">
          <div className="h-2.5 w-3/4 rounded-full bg-muted" />
          <div className="h-2.5 w-full rounded-full bg-muted" />
          <div className="h-2.5 w-5/6 rounded-full bg-muted" />
        </div>

        <div className="mt-6 flex items-center justify-between rounded-xl bg-accent p-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Émis par</p>
            <p className="text-sm font-semibold text-foreground">
              Université Paris-Saclay
            </p>
          </div>
          {/* Decorative QR code */}
          <div className="relative h-20 w-20 overflow-hidden rounded-lg border-2 border-primary/30 bg-white p-1.5">
            <QrPlaceholder />
            <div className="absolute inset-x-0 top-0 h-1 animate-scan bg-primary/50" />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-lg bg-success/10 px-3 py-2">
          <CheckCircle2 className="h-4 w-4 text-success" />
          <span className="text-xs font-medium text-success">
            Document authentifié avec succès
          </span>
        </div>
      </div>

      {/* Glow behind card */}
      <div className="absolute inset-0 -z-10 rounded-2xl bg-primary/10 blur-2xl" />
    </div>
  );
}

function QrPlaceholder() {
  const cells = Array.from({ length: 64 }, (_, i) => i);
  const isFilled = (i: number) => {
    const row = Math.floor(i / 8);
    const col = i % 8;
    const inCorner =
      (row < 2 && col < 2) ||
      (row < 2 && col > 5) ||
      (row > 5 && col < 2);
    if (inCorner) return true;
    return (i * 7 + row * 3 + col * 5) % 3 === 0;
  };

  return (
    <div className="grid h-full w-full grid-cols-8 gap-px">
      {cells.map((i) => (
        <div
          key={i}
          className={isFilled(i) ? 'bg-secondary' : 'bg-transparent'}
        />
      ))}
    </div>
  );
}
