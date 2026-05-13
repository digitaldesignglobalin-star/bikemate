export const metadata = {
  title: "Terms & Conditions — BIKEMET",
  description: "Read the terms and conditions for using the BIKEMET platform and services.",
};

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen animate-page-enter">
      <div className="max-w-3xl mx-auto px-4 md:px-8 py-12 md:py-20">

        {/* Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[0.65rem] font-black uppercase tracking-[0.25em] text-[#888] mb-6">
            📋 Legal
          </div>
          <h1 className="text-4xl md:text-5xl font-black font-heading tracking-tight mb-4">Terms & Conditions</h1>
          <p className="text-[#555] text-sm">Effective Date: May 13, 2026</p>
        </div>

        {/* Intro */}
        <div className="space-y-10">
          <p className="text-[#B0B0B0] leading-relaxed">
            Welcome to BIKEMET. By accessing or using our platform, services, mobile features, website, dashboard, tracker, vault, community, SOS tools, or related services, you agree to these Terms & Conditions.
          </p>
          <p className="text-[#999] leading-relaxed italic">
            If you do not agree with these terms, please do not use the platform.
          </p>

          <Section num="1" title="Eligibility">
            <p className="text-[#999] mb-2">
              You must be at least 18 years old or have permission from a parent/guardian to use BIKEMET.
            </p>
            <p className="text-[#999]">
              By using the platform, you confirm that the information you provide is accurate and lawful.
            </p>
          </Section>

          <Section num="2" title="User Accounts">
            <p className="text-[#999] mb-3">Users are responsible for:</p>
            <BulletList items={[
              "Maintaining account confidentiality",
              "Securing login credentials",
              "All activity under their account"
            ]} />
            <p className="text-[#666] text-sm mt-4 italic">
              We reserve the right to suspend or terminate accounts involved in suspicious, abusive, or illegal activity.
            </p>
          </Section>

          <Section num="3" title="Ride Tracking & Safety Disclaimer">
            <p className="text-[#999] mb-3">
              BIKEMET provides ride tracking, location services, SOS features, and community-based safety tools.
            </p>
            <p className="text-[#B0B0B0] font-bold mb-3">However:</p>
            <BulletList items={[
              "We do not guarantee rider safety",
              "GPS tracking may not always be accurate",
              "Emergency response times may vary",
              "Users remain fully responsible for their own riding decisions and safety precautions"
            ]} />
            <div className="bg-[#FF2E2E]/5 border border-[#FF2E2E]/10 rounded-xl p-4 mt-4">
              <p className="text-[#FF2E2E] text-sm font-bold">
                ⚠️ Users should always follow traffic laws, wear safety gear, and ride responsibly.
              </p>
            </div>
          </Section>

          <Section num="4" title="Community Guidelines">
            <p className="text-[#999] mb-3">Users must not:</p>
            <BulletList items={[
              "Post harmful, abusive, or illegal content",
              "Harass or threaten others",
              "Share misleading or false information",
              "Upload malware or harmful software",
              "Attempt unauthorized access to the platform"
            ]} />
            <p className="text-[#666] text-sm mt-4 italic">
              Violation of guidelines may result in account suspension or permanent banning.
            </p>
          </Section>

          <Section num="5" title="Payments & Purchases">
            <p className="text-[#999] mb-3">If BIKEMET offers subscriptions, memberships, products, or digital services:</p>
            <BulletList items={[
              "Prices may change without prior notice",
              "Payments must be completed through authorized methods",
              "Failed or fraudulent transactions may result in service restrictions"
            ]} />
          </Section>

          <Section num="6" title="Intellectual Property">
            <p className="text-[#999] mb-2">
              All platform content including logos, branding, graphics, text, design, software, and features belong to BIKEMET or its licensors.
            </p>
            <p className="text-[#999]">
              Users may not copy, reproduce, modify, or distribute platform assets without written permission.
            </p>
          </Section>

          <Section num="7" title="Limitation of Liability">
            <p className="text-[#999] mb-3">BIKEMET shall not be liable for:</p>
            <BulletList items={[
              "Accidents or injuries",
              "Ride-related incidents",
              "Data loss",
              "Service interruptions",
              "Unauthorized access caused by external factors",
              "Third-party service failures"
            ]} />
            <p className="text-[#B0B0B0] font-bold text-sm mt-4">
              Use of the platform is at the user&apos;s own risk.
            </p>
          </Section>

          <Section num="8" title="Service Availability">
            <p className="text-[#999]">
              We may update, modify, suspend, or discontinue any part of the platform at any time without prior notice.
            </p>
          </Section>

          <Section num="9" title="Account Termination">
            <p className="text-[#999]">
              We reserve the right to terminate or restrict access if users violate these terms or misuse the platform.
            </p>
          </Section>

          <Section num="10" title="Governing Law">
            <p className="text-[#999] mb-2">
              These Terms & Conditions shall be governed by and interpreted under the laws of India.
            </p>
            <p className="text-[#999]">
              Any disputes shall fall under the jurisdiction of the appropriate courts in India.
            </p>
          </Section>

          <Section num="11" title="Changes to Terms">
            <p className="text-[#999]">
              We may revise these Terms & Conditions at any time. Continued use of the platform after updates means you accept the revised terms.
            </p>
          </Section>

          <Section num="12" title="Contact Information">
            <ContactBlock />
          </Section>

        </div>
      </div>
    </div>
  );
}

function Section({ num, title, children }) {
  return (
    <div className="bg-[#111] border border-white/5 rounded-2xl p-6 md:p-8">
      <h2 className="text-xl font-black text-white mb-4 flex items-center gap-3">
        <span className="w-8 h-8 rounded-lg bg-[#FF2E2E]/10 text-[#FF2E2E] text-sm flex items-center justify-center font-black shrink-0">{num}</span>
        {title}
      </h2>
      {children}
    </div>
  );
}

function BulletList({ items }) {
  return (
    <ul className="space-y-1.5">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5 text-sm text-[#999]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF2E2E]/60 mt-1.5 shrink-0" />
          {item}
        </li>
      ))}
    </ul>
  );
}

function ContactBlock() {
  return (
    <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
      <p className="text-white font-black text-sm">BIKEMET</p>
      <p className="text-[#666] text-xs mt-1">A sister brand of Design Global Technology</p>
      <a href="https://bikemet.in/" className="text-[#FF2E2E] text-xs font-bold mt-2 inline-block hover:underline">
        https://bikemet.in/
      </a>
    </div>
  );
}
