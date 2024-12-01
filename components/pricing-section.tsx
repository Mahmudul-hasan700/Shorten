import { Check } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const pricingTiers = [
  {
    badge: "Basic",
    name: "Free",
    price: "Free",
    description: [
      "Great for personal use to shorten links and track basic stats."
    ],
    features: [
      "100 Shortened URLs per month",
      "Basic Analytics",
      "Limited Customization",
      "Standard Redirect Speed",
    ],
    ctaText: "Get Started",
    ctaStyle: "default",
    accentColor: "emerald",
  },
  {
    badge: "Pro",
    name: "$10",
    period: "per month",
    description: [
      "For professionals needing custom domains and detailed insights."
    ],
    features: [
      "Unlimited Shortened URLs",
      "Advanced Analytics",
      "Custom Domains",
      "Priority Redirect Speed",
    ],
    ctaText: "Try Free for 7 Days",
    ctaStyle: "golden",
    accentColor: "amber",
  },
  {
    badge: "Enterprise",
    name: "Custom",
    period: "Pricing",
    description: [
      "Custom solutions for large teams with API access and support."
    ],
    features: [
      "Unlimited URLs and Clicks",
      "Team Collaboration",
      "API Access",
      "Custom SLA & Support",
    ],
    ctaText: "Contact Us",
    ctaStyle: "white",
    accentColor: "blue",
  },
];

export default function PricingSection() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black text-white py-20 px-4 font-sans antialiased">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge
            variant="outline"
            className="mb-6 px-4 py-1.5 bg-[#1A1A1A] text-[#A1A1A1] hover:bg-[#1A1A1A] border-[#2A2A2A] rounded-full tracking-wide text-xs font-medium"
          >
            Pricing
          </Badge>
          <h2 className="text-4xl md:text-[56px] font-extrabold leading-tight mb-4 tracking-[-0.02em]">
            Choose the <span className="text-[#A1A1A1]">right plan</span>
            <br />
            <span className="text-[#A1A1A1]">for your links.</span>
          </h2>
          <p className="text-[#A1A1A1] text-lg leading-relaxed max-w-2xl mx-auto font-normal">
            Empower your links with custom domains, detailed analytics, and reliable performance.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {pricingTiers.map((tier) => (
            <div
              key={tier.badge}
              className={`relative rounded-[20px] bg-zinc-700/10 p-6 backdrop-blur-sm border border-[#1A1A1A] transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-${tier.accentColor}-500/10`}
            >
              <Badge
                variant="outline"
                className={`mb-8 px-4 py-1.5 rounded-full text-xs font-medium tracking-wide
                  bg-${tier.accentColor}-500/10 text-${tier.accentColor}-400 border-${tier.accentColor}-300/20`}
              >
                {tier.badge}
              </Badge>

              <div className="mb-6 flex items-center gap-3">
                <h3 className={`text-[40px] font-bold mb-1 tracking-tight text-${tier.accentColor}-400`}>
                  {tier.name}
                </h3>
                {tier.period && (
                  <p className="text-[#A1A1A1] text-sm tracking-wide">{tier.period}</p>
                )}
              </div>

              <p className="text-[15px] leading-relaxed text-[#A1A1A1] mb-8 font-normal">
                {tier.description}
              </p>

              <div className="mb-8">
                <Button
                  className={`w-full py-6 rounded-xl text-sm font-medium tracking-wide transition-all duration-300
                    ${tier.ctaStyle === "golden"
                      ? `bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-black`
                      : tier.ctaStyle === "white"
                        ? `bg-white hover:bg-gray-100 text-black`
                        : `bg-[#1A1A1A] hover:bg-[#252525] text-white border border-[#2A2A2A] hover:border-${tier.accentColor}-400`
                    }`}
                >
                  {tier.ctaText}
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-800"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-[#0D0D0D] px-2 text-[#A1A1A1]">Features</span>
                </div>
              </div>

              <ul className="space-y-4 mt-8">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-center text-[15px]">
                    <div className={`w-5 h-5 mr-3 flex items-center justify-center rounded-full bg-${tier.accentColor}-500/10`}>
                      <Check className={`w-3 h-3 text-${tier.accentColor}-400`} />
                    </div>
                    <span className="text-[#A1A1A1] font-normal">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

