"use client";

import type { Handedness } from "@/lib/types";
import { useProject } from "@/store/project";

const options: { value: Handedness; label: string; hint: string }[] = [
  { value: "right", label: "right-handed", hint: "row 1 goes ←" },
  { value: "left", label: "left-handed", hint: "row 1 goes →" },
];

export function HandednessToggle() {
  const handedness = useProject((s) => s.handedness);
  const setHandedness = useProject((s) => s.setHandedness);
  return (
    <fieldset>
      <legend className="mb-2 text-lg">I crochet</legend>
      <div className="grid grid-cols-2 gap-2">
        {options.map((o) => {
          const on = handedness === o.value;
          return (
            <label
              key={o.value}
              className={`paper flex min-h-11 cursor-pointer flex-col items-center justify-center px-2 py-1.5 text-center has-focus-visible:outline-2 has-focus-visible:outline-dashed has-focus-visible:outline-offset-3 ${
                on ? "bg-mint" : "bg-paper hover:bg-butter/60"
              }`}
            >
              <input
                type="radio"
                name="handedness"
                value={o.value}
                checked={on}
                onChange={() => setHandedness(o.value)}
                className="sr-only"
              />
              <span className="leading-tight">{o.label}</span>
              <span className="text-sm text-ink-soft">{o.hint}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
