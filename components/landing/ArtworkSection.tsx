import Image from "next/image";

export function ArtworkSection() {
  const artworks = [
    {
      title: "The Solitary Road in Snow",
      chinese: "雪夜孤行 · 方源",
      subtitle: "The Long Trek Through Plum Blossoms",
      description:
        "Fang Yuan journeying through cold drifts under a paper umbrella, red plum petals drifting in the breeze. A testament to his five-hundred-year endurance and refusal to bow to worldly adversity.",
      imageSrc: "/images/fang-yuan-snow.jpg",
      aspectRatio: "aspect-square",
      tag: "Character & Atmosphere",
    },
    {
      title: "The Creation of Gu",
      chinese: "蛊之创生 · 宿命之争",
      subtitle: "The Creation of Adam Parody & Demonic Rebirth",
      description:
        "Fang Yuan in demonic robes reaching out across the cosmos toward the divine—symbolizing the immortal struggle of mortal Gu masters seizing the miraculous laws of heaven and earth for themselves.",
      imageSrc: "/images/fang-yuan-creation.png",
      aspectRatio: "aspect-[16/10]",
      tag: "Cosmic Defiance",
    },
  ];

  const motifs = [
    {
      title: "Spring Autumn Cicada",
      rank: "Rank 6 Immortal Gu · Time Path",
      chinese: "春秋蝉",
      description:
        "Carved like jade with two delicate leaves for wings, its body shines with emerald and gold. Fueling itself upon the water of the River of Time, it grants a mortal consciousness the miracle of reversing temporal flow.",
      accent: "text-[#89b4fa]",
      symbol: (
        <svg viewBox="0 0 100 100" className="w-12 h-12 stroke-current fill-none stroke-[1.5]" aria-hidden="true">
          <ellipse cx="50" cy="50" rx="10" ry="24" />
          <path d="M40 38 C 20 20, 10 50, 42 58" />
          <path d="M60 38 C 80 20, 90 50, 58 58" />
          <path d="M42 55 C 25 65, 20 85, 45 70" />
          <path d="M58 55 C 75 65, 80 85, 55 70" />
          <circle cx="46" cy="30" r="1.5" fill="currentColor" />
          <circle cx="54" cy="30" r="1.5" fill="currentColor" />
          <line x1="50" y1="26" x2="50" y2="74" strokeDasharray="2 2" />
        </svg>
      ),
    },
    {
      title: "The River of Time",
      rank: "Cosmic Seclusion · Great Dao",
      chinese: "光阴长河",
      description:
        "The infinite metaphysical tributary traversing all five regions. Every living second is a drop of water within its surging rapids; only Immortal Gu masters of the Time Path dare tread its waters.",
      accent: "text-[#74c7ec]",
      symbol: (
        <svg viewBox="0 0 100 100" className="w-12 h-12 stroke-current fill-none stroke-[1.5]" aria-hidden="true">
          <path d="M15 35 Q 35 15, 50 35 T 85 35" />
          <path d="M15 50 Q 35 30, 50 50 T 85 50" />
          <path d="M15 65 Q 35 45, 50 65 T 85 65" />
        </svg>
      ),
    },
  ];

  return (
    <section id="artwork" className="border-b border-[#313244]/80 bg-[#1e1e2e] py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6 sm:px-8">
        <div className="max-w-2xl mb-14">
          <span className="text-xs font-semibold tracking-widest text-[#89b4fa] uppercase">
            Visual Gallery
          </span>
          <h2 className="mt-2 font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#cdd6f4]">
            Art of the Gu Immortal Realm
          </h2>
          <p className="mt-4 text-[#a6adc8] text-base sm:text-lg leading-relaxed">
            Visual manifestations of Reverend Insanity&apos;s philosophical depth, iconic imagery, and legendary Gu artifacts.
          </p>
        </div>

        {/* Featured Artworks Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {artworks.map((art, idx) => (
            <div
              key={idx}
              className="group flex flex-col rounded-xl overflow-hidden border border-[#313244] bg-[#181825] shadow-xl transition-all hover:border-[#89b4fa]/60"
            >
              <div className={`relative ${art.aspectRatio} w-full overflow-hidden bg-[#11111b]`}>
                <Image
                  src={art.imageSrc}
                  alt={art.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 580px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#181825] via-transparent to-transparent opacity-60" />
              </div>

              <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono tracking-wider uppercase text-[#89b4fa]">
                      {art.tag}
                    </span>
                    <span className="text-xs font-serif text-[#bac2de]">
                      {art.chinese}
                    </span>
                  </div>

                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#cdd6f4] mb-1">
                    {art.title}
                  </h3>
                  <p className="text-xs font-medium text-[#74c7ec] mb-3">
                    {art.subtitle}
                  </p>

                  <p className="text-sm leading-relaxed text-[#a6adc8]">
                    {art.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#313244] text-[11px] font-mono tracking-wider text-[#6c7086] uppercase flex justify-between">
                  <span>Reverend Insanity Canon</span>
                  <span className="text-[#89b4fa]">Archival View</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Gu Motifs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {motifs.map((motif, idx) => (
            <div
              key={idx}
              className="relative overflow-hidden rounded-lg border border-[#313244] bg-[#181825]/70 p-6 sm:p-7 flex items-start space-x-5"
            >
              <div className={`flex-shrink-0 ${motif.accent} mt-1`}>
                {motif.symbol}
              </div>

              <div>
                <div className="text-[11px] font-mono text-[#89b4fa] tracking-wider uppercase mb-1">
                  {motif.rank}
                </div>
                <div className="flex items-baseline space-x-2 mb-2">
                  <h4 className="font-serif text-lg font-bold text-[#cdd6f4]">
                    {motif.title}
                  </h4>
                  <span className="font-serif text-xs text-[#a6adc8]">
                    {motif.chinese}
                  </span>
                </div>
                <p className="text-xs sm:text-sm leading-relaxed text-[#a6adc8]">
                  {motif.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
