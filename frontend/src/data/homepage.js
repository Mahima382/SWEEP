/**
 * Static content for the SWEEP marketing homepage.
 * Kept separate from presentational components so copy can be revised without layout changes.
 */

export const NAV_LINKS = [
  { label: "Roles", href: "#roles" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "Impact", href: "#impact" },
  { label: "FAQ", href: "#faq" },
];

/**
 * Homepage hashes only resolve on `/`. Prefix them so they work from other routes.
 * @param {string} href Hash like `#roles`
 * @param {boolean} isHome Whether the current path is `/`
 * @returns {string} In-page hash on home, otherwise `/{hash}`
 */
export function homeHash(href, isHome) {
  return isHome ? href : `/${href}`;
}

export const ROLES = [
  {
    id: "households",
    title: "Households",
    kicker: "List & earn",
    description:
      "Turn recyclable waste into a pickup request. Publish what you have, choose a time, and complete a secure handover.",
    image: "/images/household.jpg",
    imageAlt: "A person carrying cardboard ready for recycling",
    points: [
      "Create listings by material type and weight",
      "Schedule collection from your address",
      "Track pickup status until completion",
    ],
  },
  {
    id: "collectors",
    title: "Collectors",
    kicker: "Collect & deliver",
    description:
      "Accept nearby jobs, pick up sorted waste, and move it to recycling partners without informal middlemen.",
    image: "/images/collector.jpg",
    imageAlt: "Collectors loading waste into a collection truck",
    points: [
      "Browse open collection requests",
      "Confirm pickup and drop-off",
      "Receive payment after verified delivery",
    ],
  },
  {
    id: "recyclers",
    title: "Recycling companies",
    kicker: "Source & process",
    description:
      "Buy sorted feedstock with a clear chain of custody — from household listing to facility intake.",
    image: "/images/facility.jpg",
    imageAlt: "Sorted recyclable materials stacked at a recycling facility",
    points: [
      "Source plastic, paper, glass, metal, and more",
      "Record intake against a trade",
      "Keep supply traceable for audits",
    ],
  },
];

export const FEATURES = [
  {
    id: "trading",
    title: "Waste trading marketplace",
    description:
      "Households list materials, collectors claim jobs, and recyclers purchase feedstock in one shared catalog instead of scattered calls and cash deals.",
    className: "md:col-span-4 md:row-span-2",
  },
  {
    id: "collection",
    title: "Scheduled collection",
    description:
      "Match listings with collectors by location and time so pickups are planned, not improvised.",
    className: "md:col-span-2",
  },
  {
    id: "payments",
    title: "Secure transactions",
    description:
      "Hold value until pickup and delivery are confirmed, then release payment to the right party.",
    className: "md:col-span-2",
  },
  {
    id: "records",
    title: "Traceable records",
    description:
      "Every listing, collection, and intake stays on a record that households, collectors, and companies can review.",
    className: "md:col-span-3",
  },
  {
    id: "impact",
    title: "Impact you can measure",
    description:
      "See diverted weight, completed trades, and material mix — evidence that waste left the dumpster path.",
    className: "md:col-span-3",
  },
];

export const STEPS = [
  {
    step: "01",
    title: "Join as a role",
    text: "Register as a household, collector, or recycling company. Each role sees only the tools it needs.",
    image: "/images/recycle-sign.jpg",
    imageAlt: "Recycling symbol on a collection bin",
  },
  {
    step: "02",
    title: "List or browse waste",
    text: "Households publish material type, quantity, and pickup window. Collectors and recyclers browse what is available.",
    image: "/images/sorted-bins.jpg",
    imageAlt: "Color-coded recycling bins for sorted materials",
  },
  {
    step: "03",
    title: "Collect and confirm",
    text: "A collector accepts the job, completes pickup, and delivers to the matched recycling partner.",
    image: "/images/collector.jpg",
    imageAlt: "Waste collectors working with a collection truck",
  },
  {
    step: "04",
    title: "Settle and recycle",
    text: "Payment is released after confirmation. The material enters processing, and the trade is closed on the record.",
    image: "/images/facility.jpg",
    imageAlt: "Recyclable goods staged for processing",
  },
];

export const STATS = [
  { value: "3", label: "Roles on one platform" },
  { value: "4", label: "Steps from list to recycle" },
  { value: "1", label: "Shared, traceable ledger" },
];

export const MATERIALS = [
  "Plastic",
  "Paper",
  "Cardboard",
  "Glass",
  "Metal",
  "E-waste",
  "Organic",
  "Textiles",
];

export const MATERIAL_SAMPLES = {
  Plastic: {
    title: "PET plastic bottles",
    meta: "8.4 kg · Household · Sorted",
    window: "Pickup window today, 4–6 pm",
    image: "/images/bottles.jpg",
  },
  Paper: {
    title: "Office paper stacks",
    meta: "12 kg · Household · Dry",
    window: "Pickup tomorrow, 10–12 am",
    image: "/images/cardboard.jpg",
  },
  Cardboard: {
    title: "Flattened shipping boxes",
    meta: "6.1 kg · Household · Clean",
    window: "Pickup today, 2–4 pm",
    image: "/images/cardboard.jpg",
  },
  Glass: {
    title: "Clear glass jars",
    meta: "4.8 kg · Household · Rinsed",
    window: "Pickup Friday, 9–11 am",
    image: "/images/bins.jpg",
  },
  Metal: {
    title: "Aluminum cans",
    meta: "3.2 kg · Household · Crushed",
    window: "Pickup today, 5–7 pm",
    image: "/images/cans.jpg",
  },
  "E-waste": {
    title: "Old phone & charger",
    meta: "1 item · Household · Bagged",
    window: "Special pickup, Sat 11–1",
    image: "/images/ewaste.jpg",
  },
  Organic: {
    title: "Kitchen scraps",
    meta: "5.0 kg · Household · Compost",
    window: "Pickup tomorrow, 7–9 am",
    image: "/images/organic.jpg",
  },
  Textiles: {
    title: "Wearable cotton clothes",
    meta: "2 bags · Household · Clean",
    window: "Pickup Sunday, 3–5 pm",
    image: "/images/textiles.jpg",
  },
};

export const GALLERY = [
  {
    src: "/images/sorted-bins.jpg",
    alt: "Red, yellow, and green recycling bins lined up for sorted waste",
    caption: "Sorted household bins",
  },
  {
    src: "/images/bottles.jpg",
    alt: "Assorted plastic bottles collected for recycling",
    caption: "Plastic ready to trade",
  },
  {
    src: "/images/collector.jpg",
    alt: "Collectors loading bags onto a waste collection truck",
    caption: "Collectors on the route",
  },
  {
    src: "/images/facility.jpg",
    alt: "Bales and boxes of recyclables at a processing facility",
    caption: "Facility intake",
  },
  {
    src: "/images/cardboard.jpg",
    alt: "Stacks of cardboard prepared for recycling",
    caption: "Paper and cardboard",
  },
  {
    src: "/images/cans.jpg",
    alt: "A large pile of plastic bottles and metal cans",
    caption: "Material back in the loop",
  },
];

export const FAQS = [
  {
    question: "What is SWEEP?",
    answer:
      "SWEEP is a waste marketplace that connects households, garbage collectors, and recycling companies. It supports listing recyclable materials, scheduling collection, completing secure trades, and keeping a traceable record of what was diverted from landfill.",
  },
  {
    question: "Who can join the platform?",
    answer:
      "Three roles can join: households that generate recyclable waste, collectors who pick up and deliver materials, and recycling companies that buy sorted feedstock. Each role sees only the tools it needs.",
  },
  {
    question: "How does a household list waste?",
    answer:
      "Create an account, choose the material type (plastic, paper, cardboard, glass, metal, e-waste, organic, or textiles), add an approximate weight, and set a pickup window. Collectors nearby can then claim the listing.",
  },
  {
    question: "How do collectors get paid?",
    answer:
      "When a collector accepts a job, payment is held until pickup and delivery are confirmed. After the recycling partner records intake, the trade is closed and payment is released to the collector.",
  },
  {
    question: "Which materials can be traded?",
    answer:
      "SWEEP is designed for plastic, paper, cardboard, glass, metal, e-waste, organic waste, and textiles. Listings should be sorted and described honestly so collectors and recyclers can plan the right pickup.",
  },
  {
    question: "Are transactions secure?",
    answer:
      "Yes. Value is held until both collection and delivery are confirmed. Every listing, pickup, and intake stays on a shared record that households, collectors, and companies can review.",
  },
  {
    question: "Does SWEEP invent impact numbers?",
    answer:
      "No. Impact is measured from completed trades: kilograms collected, listings closed, and intakes confirmed by recycling partners. The platform records what actually moved.",
  },
];

export const JOIN_ROLES = [
  { id: "household", label: "Household" },
  { id: "collector", label: "Collector" },
  { id: "recycler", label: "Recycler" },
];

export const FOOTER_COLUMNS = [
  {
    title: "Platform",
    links: [
      { label: "How it works", href: "#how-it-works" },
      { label: "Features", href: "#features" },
      { label: "Impact", href: "#impact" },
      { label: "FAQ", href: "#faq" },
    ],
  },
  {
    title: "Roles",
    links: [
      { label: "Households", href: "#roles" },
      { label: "Collectors", href: "#roles" },
      { label: "Recycling companies", href: "#roles" },
    ],
  },
];
