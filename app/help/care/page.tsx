import type { Metadata } from "next";
import { ProsePage, ProseSection } from "@/components/content/prose-page";

export const metadata: Metadata = {
  title: "Care guide",
  description: "How to care for your full-grain leather BagsArt piece — daily, monthly, and forever.",
};

export default function CarePage() {
  return (
    <ProsePage
      eyebrow="Help"
      title="Care guide"
      intro="Leather is a living material. With minimal attention it darkens and softens — develops what we call a patina — for decades."
    >
      <ProseSection id="daily" title="Daily">
        <p>
          A dry, soft microfibre cloth, once or twice a week. Wipe in the
          direction of the grain to lift dust before it settles.
        </p>
      </ProseSection>

      <ProseSection id="monthly" title="Monthly">
        <p>
          Apply a thin coat of a neutral leather conditioner with a clean cloth.
          Buff lightly after 10 minutes. We use <em>Saphir Médaille d'Or</em> in
          the studio — most pH-neutral conditioners work as well.
        </p>
      </ProseSection>

      <ProseSection id="rain" title="If it gets wet">
        <p>
          Blot — don't rub — with a dry towel and let the bag air-dry at room
          temperature, away from radiators and direct sun. Once dry, condition
          immediately to restore the natural oils.
        </p>
      </ProseSection>

      <ProseSection id="storage" title="Storage">
        <p>
          When you're not using a piece, stuff the interior loosely with the
          dust bag it came in (or acid-free tissue), then store it inside the
          outer cotton bag. Avoid sealed plastic — leather needs air.
        </p>
      </ProseSection>

      <ProseSection id="hardware" title="Brass hardware">
        <p>
          Our solid brass develops a warm patina over time. To keep it bright,
          buff occasionally with a soft cloth and a touch of brass polish — but
          most of our customers come to love the aged look.
        </p>
      </ProseSection>

      <ProseSection id="avoid" title="What to avoid">
        <ul className="list-disc list-inside space-y-1.5 text-muted-foreground">
          <li>Alcohol, solvents, baby wipes</li>
          <li>Prolonged direct sunlight</li>
          <li>High heat (above 40°C / 104°F)</li>
          <li>Storing while still damp</li>
        </ul>
      </ProseSection>
    </ProsePage>
  );
}
