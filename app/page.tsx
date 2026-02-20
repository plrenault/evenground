export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-800">

      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-32">
        <h1 className="text-4xl md:text-5xl font-semibold mb-6">
          Structured Co-Parenting. <br /> Calm Communication.
        </h1>

        <p className="max-w-2xl text-gray-600 mb-8">
          Divorce often brings heightened emotions and logistical friction.
          EvenGround brings structure, clarity, and respect to both communication
          and coordination — so energy can be focused where it matters most:
          the children.
        </p>

        <div className="space-x-4">
          <a
            href="/dashboard"
            className="bg-black text-white px-6 py-3 rounded-lg"
          >
            Go to App
          </a>

          <a
            href="/requests"
            className="border border-gray-300 px-6 py-3 rounded-lg"
          >
            View Requests
          </a>
        </div>
      </section>

      {/* Problem / Solution */}
      <section className="grid md:grid-cols-2 gap-16 px-8 md:px-20 py-20">
        <div>
          <h2 className="text-xl font-semibold mb-4">The Problem</h2>
          <p className="text-gray-600">
            Co-parenting communication often happens in emotional bursts,
            scattered texts, and unclear agreements. This creates friction,
            confusion, and unnecessary escalation.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">The Solution</h2>
          <p className="text-gray-600">
            EvenGround transforms communication into structured requests
            with clear approval workflows, calm messaging guidance, and
            shared visibility across both parents.
          </p>
        </div>
      </section>

      {/* Feature Section */}
      <section className="px-8 md:px-20 py-20 text-center">
        <h2 className="text-2xl font-semibold mb-12">
          Designed for Calm, Transactional Coordination
        </h2>

        <div className="grid md:grid-cols-2 gap-12 text-left">
          <div>
            <h3 className="font-semibold mb-2">Structured Request System</h3>
            <p className="text-gray-600">
              Replace emotional text threads with formal custody swaps,
              expense approvals, and schedule changes — all tracked clearly.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">
              Approval & Decision Lifecycle
            </h3>
            <p className="text-gray-600">
              Every request moves through a transparent pending,
              approved, or declined workflow.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Tone Guard</h3>
            <p className="text-gray-600">
              AI-powered tone review helps reduce escalatory language
              before messages are sent.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">
              Shared Awareness Dashboard
            </h3>
            <p className="text-gray-600">
              See what’s pending, what needs your approval, and what’s upcoming —
              in one calm interface.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-gray-900 text-white text-center py-20 px-6">
        <h2 className="text-2xl font-semibold mb-6">
          Transform Co-Parenting Into Calm, Structured Coordination.
        </h2>

        <a
          href="/signup"
          className="bg-white text-black px-6 py-3 rounded-lg"
        >
          Enter EvenGround
        </a>
      </section>
    </div>
  );
}