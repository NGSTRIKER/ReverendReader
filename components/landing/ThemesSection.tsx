export function ThemesSection() {
  const themes = [
    {
      title: "Solitude & Eternal Life",
      chinese: "永生之志",
      quote: "Even if I fail and fall upon the journey, having walked this road with all my heart, I will have no regrets.",
      description:
        "The story strips away romantic illusions of cultivation. Immortality is not treated as a trophy of destiny, but as an almost impossible ideal that demands absolute perseverance, emotional resilience, and the acceptance of utter isolation.",
    },
    {
      title: "The Subversion of Morality",
      chinese: "正魔之道",
      quote: "Rules are created to govern the weak; the strong treat rules as their instruments.",
      description:
        "Gu Zhen Ren meticulously deconstructs the dichotomy of righteous and demonic. Righteousness is revealed as systemic preservation of clan hierarchy, while demonic cultivation is individual survival stripped of civilized pretenses.",
    },
    {
      title: "The Heavenly Dao vs. The Human Dao",
      chinese: "天道与人道",
      quote: "The Dao of Heaven diminishes surplus to replenish deficits; the Dao of Man diminishes deficits to offer unto surplus.",
      description:
        "A profound philosophical counterpoint rooted in classical Daoism. The world naturally seeks equilibrium and balance, whereas human ambition inherently creates inequality, monopolizing resources to ascend beyond mortal bounds.",
    },
    {
      title: "Defiance Against Preordained Fate",
      chinese: "宿命与挣扎",
      quote: "If fate dictates that I must bow, then I shall sever the threads of fate itself.",
      description:
        "The overarching narrative confrontation pits human free will against Heavenly Court and the indestructible Fate Gu. It is an exploration of whether an individual's will can overcome the script written by the cosmos.",
    },
  ];

  return (
    <section id="themes" className="border-b border-[#313244]/80 bg-[#1e1e2e] py-20 sm:py-28">
      <div className="mx-auto max-w-5xl px-6 sm:px-8">
        <div className="max-w-2xl mb-14">
          <span className="text-xs font-semibold tracking-widest text-[#89b4fa] uppercase">
            Philosophical Core
          </span>
          <h2 className="mt-2 font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#cdd6f4]">
            Literary Themes & Exploration
          </h2>
          <p className="mt-4 text-[#a6adc8] text-base sm:text-lg leading-relaxed">
            Beneath its relentless pacing and intricate tactical maneuvering, Reverend Insanity engages deeply with
            existential philosophy, game theory, and human nature.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {themes.map((theme, idx) => (
            <div
              key={idx}
              className="group relative rounded-lg border border-[#313244] bg-[#181825]/70 p-8 transition-colors hover:border-[#89b4fa]/50"
            >
              <div className="flex items-baseline justify-between mb-4">
                <span className="font-serif text-2xl font-bold text-[#cdd6f4]">
                  {theme.title}
                </span>
                <span className="font-serif text-xs tracking-widest text-[#89b4fa]">
                  {theme.chinese}
                </span>
              </div>

              <blockquote className="mb-4 border-l-2 border-[#89b4fa]/60 pl-3 text-xs italic text-[#bac2de] leading-relaxed">
                &ldquo;{theme.quote}&rdquo;
              </blockquote>

              <p className="text-sm leading-relaxed text-[#a6adc8]">
                {theme.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
