export function SynopsisSection() {
  return (
    <section id="synopsis" className="border-b border-[#313244]/80 bg-[#1e1e2e] py-20 sm:py-28">
      <div className="mx-auto max-w-5xl px-6 sm:px-8">
        <div className="max-w-2xl mb-12">
          <span className="text-xs font-semibold tracking-widest text-[#89b4fa] uppercase">
            Narrative Overview
          </span>
          <h2 className="mt-2 font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#cdd6f4]">
            A Ruthless Path to Eternity
          </h2>
          <p className="mt-4 text-[#a6adc8] text-base sm:text-lg leading-relaxed">
            Reverend Insanity is a masterwork of dark fantasy world-building, stripping away standard hero tropes
            to explore power, philosophy, and perseverance with surgical clarity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="rounded-lg border border-[#313244] bg-[#181825]/70 p-6 sm:p-8">
            <div className="mb-4 text-xs font-mono tracking-wider text-[#89b4fa] uppercase">
              01 / The Rebirth
            </div>
            <h3 className="font-serif text-xl font-semibold text-[#cdd6f4] mb-3">
              The Spring Autumn Cicada
            </h3>
            <p className="text-sm leading-relaxed text-[#a6adc8]">
              Surrounded by righteous and demonic factions at the culmination of five centuries of bitter cultivation,
              Fang Yuan triggers the legendary Rank 6 Spring Autumn Cicada. Sacrificing his mortal frame, his consciousness
              reverses up the River of Time, awakening in his fifteen-year-old body on Mount Qing Mao with memories of an
              entire epoch intact.
            </p>
          </div>

          <div className="rounded-lg border border-[#313244] bg-[#181825]/70 p-6 sm:p-8">
            <div className="mb-4 text-xs font-mono tracking-wider text-[#89b4fa] uppercase">
              02 / The Ecosystem
            </div>
            <h3 className="font-serif text-xl font-semibold text-[#cdd6f4] mb-3">
              Nurture, Use, Refine
            </h3>
            <p className="text-sm leading-relaxed text-[#a6adc8]">
              Unlike traditional cultivation worlds of spells and internal spiritual qi, power in the Gu World is
              channeled through living metaphysical organisms known as Gu. Each Gu possesses a singular miraculous ability,
              yet demands perilous feeding, refined synchronization with an aperture, and extreme resource expenditure.
            </p>
          </div>

          <div className="rounded-lg border border-[#313244] bg-[#181825]/70 p-6 sm:p-8">
            <div className="mb-4 text-xs font-mono tracking-wider text-[#89b4fa] uppercase">
              03 / The Protagonist
            </div>
            <h3 className="font-serif text-xl font-semibold text-[#cdd6f4] mb-3">
              Pure Pragmatism
            </h3>
            <p className="text-sm leading-relaxed text-[#a6adc8]">
              Fang Yuan is neither a savior nor a sadist. He possesses no petty spite, no desire for vainglory, and no
              subservience to clan or righteous hypocrisy. Every breath, alliance, and sacrifice is weighed against his
              single unwavering desire: to attain eternal life, knowing that even if he perishes upon the road, he will
              have lived without regrets.
            </p>
          </div>
        </div>

        {/* Narrative Context Block */}
        <div className="mt-12 rounded-lg border border-[#313244] bg-[#181825] p-8 sm:p-10">
          <div className="max-w-3xl">
            <h3 className="font-serif text-2xl font-semibold text-[#cdd6f4] mb-4">
              The Five Regions and Nine Heavens
            </h3>
            <p className="text-sm sm:text-base leading-relaxed text-[#a6adc8] mb-4">
              The story expands across the vast expanse of the Five Regions—Southern Border, Northern Plains, Western Desert,
              Eastern Sea, and Central Continent—each home to distinct clans, sects, and ancient inheritances. Looming above
              them are the remnants of the immemorial Nine Heavens and the timeless Court of Fate.
            </p>
            <p className="text-sm sm:text-base leading-relaxed text-[#a6adc8]">
              As Fang Yuan schemes across regional boundaries, mortal tribulations give way to celestial warfare,
              venerable conspiracies spanning millions of years, and the ultimate struggle against preordained fate.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
