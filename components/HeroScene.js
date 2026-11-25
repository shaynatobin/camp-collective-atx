// Hill Country summer scene for the home page hero. Drawn for Camp Collective
// in the site's own colors (no outside artwork), so it can be swapped any time.
export default function HeroScene({ className = '' }) {
  return (
    <svg
      viewBox="0 0 1200 240"
      preserveAspectRatio="xMidYMax slice"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {/* Sun */}
      <circle cx="830" cy="104" r="56" fill="#F2C14E" opacity="0.22" />
      <circle cx="830" cy="104" r="34" fill="#F2C14E" />

      {/* Clouds */}
      <g fill="#FAF6EF">
        <ellipse cx="300" cy="96" rx="46" ry="13" />
        <ellipse cx="330" cy="87" rx="28" ry="14" />
        <ellipse cx="1010" cy="104" rx="40" ry="11" />
        <ellipse cx="1034" cy="96" rx="22" ry="12" />
      </g>

      {/* Birds */}
      <g transform="translate(0 38)" fill="none" stroke="#6B6558" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M520 70q7-7 14 0q7-7 14 0" />
        <path d="M556 52q5-5 10 0q5-5 10 0" />
      </g>

      {/* Far hills */}
      <path
        d="M0 150C120 118 230 104 360 122S600 160 720 132 960 92 1080 110 1200 140 1200 140V240H0z"
        fill="#B8CDB0"
      />
      {/* Middle hills */}
      <path
        d="M0 182C150 150 260 146 400 164S650 196 800 170 1040 136 1200 160V240H0z"
        fill="#6E9B78"
      />

      {/* Cedar trees on the middle hill */}
      <g fill="#3B6E52">
        <path d="M150 168l14-34 14 34z" />
        <path d="M172 168l10-24 10 24z" />
        <path d="M968 158l14-36 14 36z" />
        <path d="M992 158l11-26 11 26z" />
        <path d="M1050 160l9-22 9 22z" />
      </g>

      {/* Front hill */}
      <path
        d="M0 214C180 190 330 186 480 198S760 222 920 206 1110 186 1200 196V240H0z"
        fill="#3B6E52"
      />

      {/* River bend */}
      <path
        d="M560 240C600 226 650 220 720 214S900 204 1020 208 1160 214 1210 212"
        fill="none"
        stroke="#F3ECDD"
        strokeWidth="7"
        strokeLinecap="round"
        opacity="0.75"
      />

      {/* Tent */}
      <g transform="translate(100 0)">
        <path d="M300 202l36-56 36 56z" fill="#E8794A" />
        <path d="M336 146l-12 56h24z" fill="#C25E33" />
        <path d="M336 146v-12" stroke="#26241F" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M336 134l14 5-14 5z" fill="#F2C14E" />
      </g>

      {/* Campfire */}
      <g transform="translate(100 0)">
        <path d="M402 204l22-6M402 198l22 6" stroke="#274A38" strokeWidth="4" strokeLinecap="round" />
        <path d="M413 196c-8-6-4-14 0-20 1 6 7 8 6 14-1 4-3 6-6 6z" fill="#E8794A" />
        <path d="M413 196c-3-3-2-7 0-10 1 3 3 4 3 7 0 2-1 3-3 3z" fill="#F2C14E" />
      </g>

      {/* Trees on the front hill */}
      <g fill="#274A38">
        <path d="M330 204l16-42 16 42z" />
        <path d="M356 204l11-28 11 28z" />
        <path d="M1110 200l15-40 15 40z" />
      </g>
    </svg>
  )
}
