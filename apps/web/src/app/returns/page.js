export const metadata = {
  title: "Return & Refund Policy — BIKEMET",
  description: "BIKEMET return, refund, exchange, and cancellation policy for products and services.",
};

export default function ReturnPolicy() {
  return (
    <div className="min-h-screen animate-page-enter">
      <div className="max-w-3xl mx-auto px-4 md:px-8 py-12 md:py-20">

        {/* Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[0.65rem] font-black uppercase tracking-[0.25em] text-[#888] mb-6">
            📦 Legal
          </div>
          <h1 className="text-4xl md:text-5xl font-black font-heading tracking-tight mb-4">Return & Refund Policy</h1>
          <p className="text-[#555] text-sm">Effective Date: May 13, 2026</p>
        </div>

        {/* Intro */}
        <div className="space-y-10">
          <p className="text-[#B0B0B0] leading-relaxed">
            This Return & Refund Policy applies to purchases made through BIKEMET including physical products, merchandise, subscriptions, memberships, accessories, or digital services.
          </p>

          <Section num="1" title="Return Eligibility">
            <p className="text-[#999] mb-3">Products may be eligible for return if:</p>
            <BulletList items={[
              "The item is damaged during delivery",
              "Wrong product was received",
              "Product has a manufacturing defect",
              "Return request is raised within 7 days of delivery"
            ]} />
            <p className="text-[#999] mt-5 mb-3">Returned items must:</p>
            <BulletList items={[
              "Be unused and in original condition",
              "Include original packaging",
              "Include invoice or proof of purchase"
            ]} />
          </Section>

          <Section num="2" title="Non-Returnable Items">
            <p className="text-[#999] mb-3">The following items are generally non-returnable:</p>
            <BulletList items={[
              "Used products",
              "Digital memberships or subscriptions",
              "Downloadable products",
              "Customized or personalized items",
              "Items damaged due to user misuse"
            ]} />
          </Section>

          <Section num="3" title="Refund Process">
            <p className="text-[#999] mb-3">Once the returned item is received and inspected:</p>
            <BulletList items={[
              "Approved refunds will be processed within 7–14 business days",
              "Refunds will be sent to the original payment method",
              "Processing time may vary depending on banks or payment gateways"
            ]} />
          </Section>

          <Section num="4" title="Exchange Policy">
            <p className="text-[#999] mb-3">Eligible products may be exchanged for:</p>
            <BulletList items={[
              "Wrong size",
              "Defective item",
              "Damaged product received"
            ]} />
            <p className="text-[#666] text-sm mt-4 italic">
              Exchange requests are subject to stock availability.
            </p>
          </Section>

          <Section num="5" title="Cancellation Policy">
            <p className="text-[#999] mb-2">
              Orders may only be canceled before shipment or processing.
            </p>
            <p className="text-[#999]">
              Once shipped, cancellation may not be possible.
            </p>
          </Section>

          <Section num="6" title="Shipping Charges">
            <BulletList items={[
              "Original shipping fees may be non-refundable",
              "Return shipping charges may be borne by the customer unless the issue was caused by us"
            ]} />
          </Section>

          <Section num="7" title="Damaged or Incorrect Orders">
            <p className="text-[#999]">
              Users should report damaged or incorrect products within 48 hours of delivery with proper photos/videos as proof.
            </p>
            <div className="bg-yellow-400/5 border border-yellow-400/10 rounded-xl p-4 mt-4">
              <p className="text-yellow-400 text-sm font-bold">
                ⏰ Report within 48 hours with photo/video evidence for fastest resolution.
              </p>
            </div>
          </Section>

          <Section num="8" title="Fraudulent Claims">
            <p className="text-[#999]">
              BIKEMET reserves the right to reject refund or return requests found to be abusive, fraudulent, or misleading.
            </p>
          </Section>

          <Section num="9" title="Contact Information">
            <p className="text-[#999] mb-3">For return, refund, or exchange support:</p>
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
