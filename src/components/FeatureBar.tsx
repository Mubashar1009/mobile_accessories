import { Shield, Award, Headphones, RotateCcw, BadgeCheck } from "lucide-react";

const features = [
  { icon: Shield, label: "365 Days", sublabel: "Official warranty" },
  { icon: BadgeCheck, label: "Certified", sublabel: "Genuine products" },
  { icon: RotateCcw, label: "7-Day Return", sublabel: "Easy returns" },
  { icon: Headphones, label: "24/7", sublabel: "WhatsApp support" },
  { icon: Award, label: "Best Price", sublabel: "Guaranteed" },
];

export function FeatureBar() {
  return (
    <section className="border-y bg-card">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {features.map((feat) => (
            <div key={feat.label} className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <feat.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">{feat.label}</p>
                <p className="text-[11px] text-muted-foreground">{feat.sublabel}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
