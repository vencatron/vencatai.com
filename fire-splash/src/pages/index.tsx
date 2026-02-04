import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";
import { Input } from "@heroui/input";
import { DoomFire } from "@/components/DoomFire";

// Globe icon for URL input
const GlobeIcon = () => (
  <svg
    className="w-5 h-5 text-white/40"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 003 12c0-1.605.42-3.113 1.157-4.418"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Icon components for feature cards
const ClockIcon = () => (
  <svg
    className="w-8 h-8 text-warning"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const PaginationIcon = () => (
  <svg
    className="w-8 h-8 text-success"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ApiIcon = () => (
  <svg
    className="w-8 h-8 text-primary"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function IndexPage() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-x-hidden">
      {/* Background Layer */}
      <DoomFire />

      <main className="relative z-10 w-full max-w-5xl px-6 flex flex-col gap-14 items-center">

        {/* Hero Section */}
        <section className="text-center">
          <p className="text-sm md:text-base text-white/40 font-mono tracking-[0.3em] uppercase mb-2">
            Vencat
          </p>
          <h1
            className="text-6xl md:text-8xl font-black tracking-widest text-white mb-4 mix-blend-difference"
            style={{ fontFamily: '"Michroma", sans-serif' }}
          >
            SCRAPR
          </h1>
          <p className="text-lg md:text-2xl text-white/70 font-mono tracking-widest uppercase mb-4">
            Turn any webpage into a one-page brief.
          </p>
          <p className="text-base md:text-lg text-white/50 font-mono tracking-[0.2em] uppercase mb-8">
            Context. Claims. Proof. No code.
          </p>

          {/* URL Input Bar */}
          <div className="w-full max-w-2xl mb-8">
            <div className="flex gap-0">
              <Input
                classNames={{
                  base: "flex-1",
                  mainWrapper: "h-full",
                  input: "text-sm text-white/80 placeholder:text-white/30",
                  inputWrapper: [
                    "h-12",
                    "bg-black/40",
                    "border",
                    "border-white/10",
                    "border-r-0",
                    "rounded-none",
                    "rounded-l-lg",
                    "backdrop-blur-md",
                    "hover:bg-black/50",
                    "group-data-[focus=true]:bg-black/50",
                    "!cursor-text",
                  ].join(" "),
                }}
                placeholder="https://example.com/products"
                startContent={<GlobeIcon />}
                type="url"
              />
              <Button
                className="h-12 font-bold rounded-none rounded-r-lg px-8 tracking-wider"
                color="warning"
                size="lg"
                variant="shadow"
              >
                GENERATE BRIEF
              </Button>
            </div>
          </div>

          <Button
            size="lg"
            color="warning"
            variant="shadow"
            className="font-bold rounded-none px-12 tracking-widest"
          >
            SEE A LIVE EXAMPLE
          </Button>
        </section>

        {/* Pick a Goal */}
        <section className="w-full">
          <p className="text-center text-white/40 text-sm font-mono tracking-wider uppercase mb-5">
            Pick a goal, not a template
          </p>
          <div className="grid md:grid-cols-3 gap-6 w-full">
            <Card className="bg-black/40 border border-white/10 backdrop-blur-md shadow-2xl">
              <CardHeader className="pb-0 pt-4 px-4 flex-col items-start">
                <p className="text-tiny uppercase font-bold text-warning/80">Popular</p>
                <h4 className="font-bold text-large text-white">Competitor Snapshot</h4>
              </CardHeader>
              <CardBody className="overflow-visible py-4">
                <p className="text-default-400 text-sm">
                  What they sell, who it's for, why it wins, and how to beat it.
                </p>
              </CardBody>
            </Card>

            <Card className="bg-black/40 border border-white/10 backdrop-blur-md shadow-2xl">
              <CardHeader className="pb-0 pt-4 px-4 flex-col items-start">
                <p className="text-tiny uppercase font-bold text-success/80">Sales</p>
                <h4 className="font-bold text-large text-white">Pricing & Offers</h4>
              </CardHeader>
              <CardBody className="overflow-visible py-4">
                <p className="text-default-400 text-sm">
                  Plans, price points, trials, guarantees, and hidden fees.
                </p>
              </CardBody>
            </Card>

            <Card className="bg-black/40 border border-white/10 backdrop-blur-md shadow-2xl">
              <CardHeader className="pb-0 pt-4 px-4 flex-col items-start">
                <p className="text-tiny uppercase font-bold text-primary/80">Support</p>
                <h4 className="font-bold text-large text-white">FAQ Digest</h4>
              </CardHeader>
              <CardBody className="overflow-visible py-4">
                <p className="text-default-400 text-sm">
                  The top questions, policies, and objections answered in plain language.
                </p>
              </CardBody>
            </Card>

            <Card className="bg-black/40 border border-white/10 backdrop-blur-md shadow-2xl">
              <CardHeader className="pb-0 pt-4 px-4 flex-col items-start">
                <p className="text-tiny uppercase font-bold text-warning/80">Marketing</p>
                <h4 className="font-bold text-large text-white">Trust Signals</h4>
              </CardHeader>
              <CardBody className="overflow-visible py-4">
                <p className="text-default-400 text-sm">
                  Testimonials, customer logos, claims, and proof that builds credibility.
                </p>
              </CardBody>
            </Card>

            <Card className="bg-black/40 border border-white/10 backdrop-blur-md shadow-2xl">
              <CardHeader className="pb-0 pt-4 px-4 flex-col items-start">
                <p className="text-tiny uppercase font-bold text-success/80">Ops</p>
                <h4 className="font-bold text-large text-white">Team & Contact</h4>
              </CardHeader>
              <CardBody className="overflow-visible py-4">
                <p className="text-default-400 text-sm">
                  Key people, emails, socials, locations, and how to get a response.
                </p>
              </CardBody>
            </Card>

            <Card className="bg-black/40 border border-white/10 backdrop-blur-md shadow-2xl">
              <CardHeader className="pb-0 pt-4 px-4 flex-col items-start">
                <p className="text-tiny uppercase font-bold text-primary/80">Press</p>
                <h4 className="font-bold text-large text-white">Press Kit</h4>
              </CardHeader>
              <CardBody className="overflow-visible py-4">
                <p className="text-default-400 text-sm">
                  Boilerplate, mission, product lines, and the story journalists need.
                </p>
              </CardBody>
            </Card>
          </div>
        </section>

        {/* Output Preview */}
        <section className="w-full">
          <p className="text-center text-white/40 text-sm font-mono tracking-wider uppercase mb-5">
            Output preview
          </p>
          <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-6">
            <Card className="bg-black/50 border border-white/10 backdrop-blur-md shadow-2xl">
              <CardHeader className="pb-0 pt-5 px-5 flex-col items-start gap-1">
                <p className="text-tiny uppercase font-bold text-warning/80">
                  Context brief
                </p>
                <h4 className="font-bold text-2xl text-white">Lumina Desk</h4>
                <p className="text-xs text-white/40 font-mono uppercase tracking-widest">
                  Source: lumina.example - Updated 2 hours ago
                </p>
              </CardHeader>
              <CardBody className="overflow-visible py-5">
                <p className="text-default-300 text-sm leading-relaxed">
                  Lumina sells height-adjustable desks for remote teams and home offices. The
                  positioning centers on reducing back pain and boosting focus, with a clean,
                  minimalist design. Pricing starts at $499 with bundle discounts, and the primary
                  upsell is the cable management + monitor arm kit. Trust signals include 4.8
                  reviews, 50k+ desks shipped, and a 5-year warranty.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Chip
                    classNames={{
                      base: "bg-white/5 border border-white/10",
                      content: "text-white/80 text-xs font-mono tracking-wider",
                    }}
                    size="sm"
                    variant="bordered"
                  >
                    Target: Remote teams
                  </Chip>
                  <Chip
                    classNames={{
                      base: "bg-white/5 border border-white/10",
                      content: "text-white/80 text-xs font-mono tracking-wider",
                    }}
                    size="sm"
                    variant="bordered"
                  >
                    Price: $499+
                  </Chip>
                  <Chip
                    classNames={{
                      base: "bg-white/5 border border-white/10",
                      content: "text-white/80 text-xs font-mono tracking-wider",
                    }}
                    size="sm"
                    variant="bordered"
                  >
                    Trial: 30 days
                  </Chip>
                  <Chip
                    classNames={{
                      base: "bg-white/5 border border-white/10",
                      content: "text-white/80 text-xs font-mono tracking-wider",
                    }}
                    size="sm"
                    variant="bordered"
                  >
                    Warranty: 5 years
                  </Chip>
                </div>
              </CardBody>
            </Card>

            <div className="flex flex-col gap-6">
              <Card className="bg-black/40 border border-white/10 backdrop-blur-md shadow-2xl">
                <CardHeader className="pb-0 pt-4 px-4 flex-col items-start">
                  <p className="text-tiny uppercase font-bold text-success/80">Key facts</p>
                  <h4 className="font-bold text-large text-white">What matters fast</h4>
                </CardHeader>
                <CardBody className="overflow-visible py-4">
                  <ul className="text-default-400 text-sm list-disc list-inside space-y-2">
                    <li>Primary offer: electric standing desks with bundle kits.</li>
                    <li>Main CTA: "Build your desk" with 3-step configurator.</li>
                    <li>Proof: 50k+ units shipped, 4.8 average rating.</li>
                    <li>Risk: shipping 2-3 weeks on larger sizes.</li>
                  </ul>
                </CardBody>
              </Card>

              <Card className="bg-black/40 border border-white/10 backdrop-blur-md shadow-2xl">
                <CardHeader className="pb-0 pt-4 px-4 flex-col items-start">
                  <p className="text-tiny uppercase font-bold text-primary/80">Entities</p>
                  <h4 className="font-bold text-large text-white">People & brands</h4>
                </CardHeader>
                <CardBody className="overflow-visible py-4">
                  <div className="flex flex-wrap gap-2">
                    <Chip
                      classNames={{
                        base: "bg-black/40 border border-white/10",
                        content: "text-white/80 text-xs font-mono tracking-wider",
                      }}
                      size="sm"
                      variant="bordered"
                    >
                      Lumina Desk
                    </Chip>
                    <Chip
                      classNames={{
                        base: "bg-black/40 border border-white/10",
                        content: "text-white/80 text-xs font-mono tracking-wider",
                      }}
                      size="sm"
                      variant="bordered"
                    >
                      FlexTrack Frame
                    </Chip>
                    <Chip
                      classNames={{
                        base: "bg-black/40 border border-white/10",
                        content: "text-white/80 text-xs font-mono tracking-wider",
                      }}
                      size="sm"
                      variant="bordered"
                    >
                      5-Year Warranty
                    </Chip>
                    <Chip
                      classNames={{
                        base: "bg-black/40 border border-white/10",
                        content: "text-white/80 text-xs font-mono tracking-wider",
                      }}
                      size="sm"
                      variant="bordered"
                    >
                      Free Shipping
                    </Chip>
                  </div>
                </CardBody>
              </Card>

              <Card className="bg-black/40 border border-white/10 backdrop-blur-md shadow-2xl">
                <CardHeader className="pb-0 pt-4 px-4 flex-col items-start">
                  <p className="text-tiny uppercase font-bold text-warning/80">Signals</p>
                  <h4 className="font-bold text-large text-white">Claims & proof</h4>
                </CardHeader>
                <CardBody className="overflow-visible py-4">
                  <ul className="text-default-400 text-sm list-disc list-inside space-y-2">
                    <li>"Reduces back pain" backed by customer testimonials.</li>
                    <li>"Ships in 48 hours" only for select sizes.</li>
                    <li>"Built for 10 years" paired with a 5-year warranty.</li>
                  </ul>
                </CardBody>
              </Card>
            </div>
          </div>
        </section>

        {/* Content Section - concise explanation */}
        <section className="grid md:grid-cols-3 gap-6 w-full">
          <Card className="bg-black/40 border border-white/10 backdrop-blur-md shadow-2xl">
            <CardHeader className="pb-0 pt-4 px-4 flex-col items-start">
              <p className="text-tiny uppercase font-bold text-warning/80">Step 1</p>
              <h4 className="font-bold text-large text-white">Paste a URL</h4>
            </CardHeader>
            <CardBody className="overflow-visible py-4">
              <p className="text-default-400 text-sm">
                Any webpage works. We read it like a human, not a crawler.
              </p>
            </CardBody>
          </Card>

          <Card className="bg-black/40 border border-white/10 backdrop-blur-md shadow-2xl">
            <CardHeader className="pb-0 pt-4 px-4 flex-col items-start">
              <p className="text-tiny uppercase font-bold text-success/80">Step 2</p>
              <h4 className="font-bold text-large text-white">Choose a goal</h4>
            </CardHeader>
            <CardBody className="overflow-visible py-4">
              <p className="text-default-400 text-sm">
                Pick a brief: pricing, competitor, FAQ, trust signals, or press kit.
              </p>
            </CardBody>
          </Card>

          <Card className="bg-black/40 border border-white/10 backdrop-blur-md shadow-2xl">
            <CardHeader className="pb-0 pt-4 px-4 flex-col items-start">
              <p className="text-tiny uppercase font-bold text-primary/80">Step 3</p>
              <h4 className="font-bold text-large text-white">Get the brief</h4>
            </CardHeader>
            <CardBody className="overflow-visible py-4">
              <p className="text-default-400 text-sm">
                Clean, decision-ready summaries with citations you can trust.
              </p>
            </CardBody>
          </Card>
        </section>

        {/* Feature Highlights Section */}
        <section className="grid md:grid-cols-3 gap-6 w-full">
          <Card className="bg-black/40 border border-white/10 backdrop-blur-md shadow-2xl">
            <CardHeader className="pb-0 pt-4 px-4 flex-col items-center gap-2">
              <ClockIcon />
              <h4 className="font-bold text-large text-white">Change Alerts</h4>
            </CardHeader>
            <CardBody className="overflow-visible py-4 text-center">
              <p className="text-default-400 text-sm">
                Know when pricing, claims, or policies shift without re-checking.
              </p>
            </CardBody>
          </Card>

          <Card className="bg-black/40 border border-white/10 backdrop-blur-md shadow-2xl">
            <CardHeader className="pb-0 pt-4 px-4 flex-col items-center gap-2">
              <PaginationIcon />
              <h4 className="font-bold text-large text-white">Multi-Page Coverage</h4>
            </CardHeader>
            <CardBody className="overflow-visible py-4 text-center">
              <p className="text-default-400 text-sm">
                We connect product, pricing, and FAQ pages into one brief.
              </p>
            </CardBody>
          </Card>

          <Card className="bg-black/40 border border-white/10 backdrop-blur-md shadow-2xl">
            <CardHeader className="pb-0 pt-4 px-4 flex-col items-center gap-2">
              <ApiIcon />
              <h4 className="font-bold text-large text-white">Cited Sources</h4>
            </CardHeader>
            <CardBody className="overflow-visible py-4 text-center">
              <p className="text-default-400 text-sm">
                Every claim links back to the exact page section it came from.
              </p>
            </CardBody>
          </Card>
        </section>

        {/* Export Format Selector */}
        <section className="w-full">
          <p className="text-center text-white/40 text-sm font-mono tracking-wider uppercase mb-4">
            Deliverables people actually use
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Chip
              classNames={{
                base: "bg-black/40 border border-white/10 backdrop-blur-md hover:bg-white/10 cursor-pointer transition-colors",
                content: "text-white/80 font-mono tracking-wider",
              }}
              size="lg"
              variant="bordered"
            >
              One-page brief
            </Chip>
            <Chip
              classNames={{
                base: "bg-black/40 border border-white/10 backdrop-blur-md hover:bg-white/10 cursor-pointer transition-colors",
                content: "text-white/80 font-mono tracking-wider",
              }}
              size="lg"
              variant="bordered"
            >
              Exec summary
            </Chip>
            <Chip
              classNames={{
                base: "bg-black/40 border border-white/10 backdrop-blur-md hover:bg-white/10 cursor-pointer transition-colors",
                content: "text-white/80 font-mono tracking-wider",
              }}
              size="lg"
              variant="bordered"
            >
              Sales email draft
            </Chip>
            <Chip
              classNames={{
                base: "bg-black/40 border border-white/10 backdrop-blur-md hover:bg-white/10 cursor-pointer transition-colors",
                content: "text-white/80 font-mono tracking-wider",
              }}
              size="lg"
              variant="bordered"
            >
              Meeting notes
            </Chip>
            <Chip
              classNames={{
                base: "bg-black/40 border border-white/10 backdrop-blur-md hover:bg-white/10 cursor-pointer transition-colors",
                content: "text-white/80 font-mono tracking-wider",
              }}
              size="lg"
              variant="bordered"
            >
              FAQ digest
            </Chip>
          </div>
        </section>

        <Divider className="bg-white/10" />

        <p className="text-center text-white/30 text-xs font-mono max-w-md">
          Web context without the complexity. Built for non-technical teams.
        </p>

      </main>

      <footer className="absolute bottom-4 z-10 text-[10px] text-white/10 font-mono tracking-[0.5em]">
        VENCAT SCRAPR
      </footer>
    </div>
  );
}
