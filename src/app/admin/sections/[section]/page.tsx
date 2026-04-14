import { notFound } from "next/navigation";
import ContentForm from "@/components/admin/ContentForm";
import { getContent } from "@/lib/contentStore";

export const dynamic = "force-dynamic";

/* ─── Section metadata ───────────────────────────────────────────────────── */
const SECTION_META = {
  hero:         { label: "Hero",          description: "Full-screen hero with background image, heading and CTA button.",          preview: "/" },
  ashgabat:     { label: "Ashgabat",      description: "Horizontal photo carousel showcasing the White Marble City.",              preview: "/#ashgabat" },
  events:       { label: "Events",        description: "Upcoming events carousel with location, time and expandable modal.",       preview: "/#events" },
  heritage:     { label: "Heritage",      description: "Heritage sites carousel with main feature image and six stories.",        preview: "/#heritage" },
  nature:       { label: "Nature",        description: "Nature destinations carousel with location labels.",                       preview: "/#nature" },
  cuisine:      { label: "Cuisine",       description: "Dish carousel, video modal and restaurant credit.",                       preview: "/#cuisine" },
  paywithease:  { label: "Pay With Ease", description: "Payment methods section (Visa / Mastercard).",                            preview: "/" },
  tours:        { label: "Tours",         description: "Featured tour card with day-by-day plan modal and pricing.",              preview: "/#tours" },
  apps:         { label: "Apps",          description: "Recommended apps for travellers in Ashgabat.",                            preview: "/#apps" },
  footer:       { label: "Footer",        description: "Footer description, contact info and copyright.",                         preview: "/" },
} as const;

type SectionKey = keyof typeof SECTION_META;

/* ─── generateStaticParams: declare known routes ─────────────────────────── */
export function generateStaticParams() {
  return Object.keys(SECTION_META).map((section) => ({ section }));
}

/* ─── Page ───────────────────────────────────────────────────────────────── */
interface Props {
  params: { section: string };
}

export default async function SectionPage({ params }: Props) {
  const key = params.section as SectionKey;
  const meta = SECTION_META[key];
  if (!meta) notFound();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let initialContent: any;
  try {
    initialContent = await getContent(key);
  } catch {
    return (
      <p className="font-inter text-sm text-[#e93725]">
        Could not load content for &quot;{key}&quot;.
      </p>
    );
  }

  return (
    <ContentForm
      key={key}
      section={key}
      sectionLabel={meta.label}
      sectionDescription={meta.description}
      initialContent={initialContent}
      previewHref={meta.preview}
    />
  );
}
