export const metadata = {
  title: "Privacy Policy — BIKEMET",
  description: "Learn how BIKEMET collects, uses, stores, and protects your information.",
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen animate-page-enter">
      <div className="max-w-3xl mx-auto px-4 md:px-8 py-12 md:py-20">

        {/* Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[0.65rem] font-black uppercase tracking-[0.25em] text-[#888] mb-6">
            🔒 Legal
          </div>
          <h1 className="text-4xl md:text-5xl font-black font-heading tracking-tight mb-4">Privacy Policy</h1>
          <p className="text-[#555] text-sm">Effective Date: May 13, 2026</p>
        </div>

        {/* Content */}
        <div className="legal-content space-y-10">

          <p className="text-[#B0B0B0] leading-relaxed">
            Welcome to BIKEMET (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;). Your privacy is important to us. This Privacy Policy explains how we collect, use, store, and protect your information when you use our website, mobile platform, services, products, community features, tracking tools, SOS system, and related services available through BIKEMET.
          </p>
          <p className="text-[#B0B0B0] leading-relaxed">
            By accessing or using BIKEMET, you agree to the practices described in this Privacy Policy.
          </p>

          <Section num="1" title="Information We Collect">
            <SubSection title="a) Personal Information">
              <p className="text-[#999] mb-3">We may collect the following information when you register or use our services:</p>
              <BulletList items={[
                "Full name", "Email address", "Phone number", "Profile photo",
                "Emergency contact details", "Location and GPS data", "Device information",
                "Ride and activity history", "Payment or billing information (if applicable)"
              ]} />
            </SubSection>
            <SubSection title="b) Automatically Collected Information">
              <p className="text-[#999] mb-3">When you access our platform, we may automatically collect:</p>
              <BulletList items={[
                "IP address", "Browser type", "Device model",
                "Operating system", "Usage activity", "Cookies and analytics data"
              ]} />
            </SubSection>
            <SubSection title="c) Community & User Content">
              <p className="text-[#999]">
                If you upload ride logs, posts, photos, comments, diary entries, or vault data, that content may be stored on our servers.
              </p>
            </SubSection>
          </Section>

          <Section num="2" title="How We Use Your Information">
            <p className="text-[#999] mb-3">We use collected information to:</p>
            <BulletList items={[
              "Provide and improve our services",
              "Enable ride tracking and safety features",
              "Operate the SOS and emergency support system",
              "Personalize user experience",
              "Process payments and subscriptions",
              "Improve platform security",
              "Respond to support requests",
              "Send important notifications and updates",
              "Prevent fraud, abuse, or unauthorized activity"
            ]} />
          </Section>

          <Section num="3" title="GPS & Location Data">
            <p className="text-[#999] mb-3">
              Some BIKEMET features require real-time or background location access for ride tracking, safety monitoring, and SOS functionality.
            </p>
            <p className="text-[#999] mb-3">By enabling location access, you consent to:</p>
            <BulletList items={[
              "Real-time ride tracking",
              "Route monitoring",
              "Emergency assistance features",
              "Nearby rider/community functionality"
            ]} />
            <p className="text-[#666] text-sm mt-4 italic">
              You may disable location access anytime through your device settings, but some features may stop working properly.
            </p>
          </Section>

          <Section num="4" title="Cookies & Tracking Technologies">
            <p className="text-[#999] mb-3">We may use cookies, analytics tools, and similar technologies to:</p>
            <BulletList items={[
              "Improve website performance",
              "Remember user preferences",
              "Analyze traffic and engagement",
              "Enhance security"
            ]} />
            <p className="text-[#666] text-sm mt-4 italic">Users can disable cookies through browser settings.</p>
          </Section>

          <Section num="5" title="Data Sharing & Disclosure">
            <p className="text-[#B0B0B0] font-bold mb-3">We do not sell your personal information.</p>
            <p className="text-[#999] mb-3">However, we may share limited information with:</p>
            <BulletList items={[
              "Payment gateway providers",
              "Cloud hosting partners",
              "Analytics services",
              "Emergency service support (when required)",
              "Legal authorities if required by law"
            ]} />
            <p className="text-[#666] text-sm mt-4 italic">
              All third-party partners are expected to maintain reasonable data protection standards.
            </p>
          </Section>

          <Section num="6" title="Data Storage & Security">
            <p className="text-[#999]">
              We implement reasonable technical and organizational security measures to protect user information from unauthorized access, misuse, loss, or disclosure.
            </p>
            <p className="text-[#666] text-sm mt-3 italic">
              However, no internet-based platform can guarantee 100% security.
            </p>
          </Section>

          <Section num="7" title="User Rights">
            <p className="text-[#999] mb-3">Users may request to:</p>
            <BulletList items={[
              "Access their personal data",
              "Update or correct information",
              "Delete their account",
              "Withdraw consent for specific features"
            ]} />
            <p className="text-[#666] text-sm mt-4 italic">
              To request account deletion or data removal, contact us through the official support channels.
            </p>
          </Section>

          <Section num="8" title="Third-Party Links">
            <p className="text-[#999]">
              BIKEMET may contain links to third-party websites or services. We are not responsible for their privacy practices or content.
            </p>
          </Section>

          <Section num="9" title="Children's Privacy">
            <p className="text-[#999]">
              BIKEMET is not intended for children under 13 years of age. We do not knowingly collect personal data from minors.
            </p>
          </Section>

          <Section num="10" title="Changes to This Policy">
            <p className="text-[#999]">
              We may update this Privacy Policy from time to time. Updated versions will be posted on this page with a revised effective date.
            </p>
          </Section>

          <Section num="11" title="Contact Information">
            <p className="text-[#999] mb-2">For any privacy-related questions or requests, contact:</p>
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

function SubSection({ title, children }) {
  return (
    <div className="mb-5 last:mb-0">
      <h3 className="text-sm font-black text-[#B0B0B0] mb-2 uppercase tracking-widest">{title}</h3>
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
    <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5 mt-3">
      <p className="text-white font-black text-sm">BIKEMET</p>
      <p className="text-[#666] text-xs mt-1">A sister brand of Design Global Technology</p>
      <a href="https://bikemet.in/" className="text-[#FF2E2E] text-xs font-bold mt-2 inline-block hover:underline">
        https://bikemet.in/
      </a>
    </div>
  );
}
