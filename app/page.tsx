import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 sm:px-8 pt-24 sm:pt-28 pb-20 sm:pb-24 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold leading-tight">
          One Topic.
          <br />
          One Decision.
        </h1>

        <p className="mt-6 text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Text threads blend logistics with history, emotion, and unrelated
          grievances. EvenGround segments every conversation into a single
          structured request — keeping communication focused, contained,
          and transactional.
        </p>

        <p className="mt-4 text-sm text-gray-500">
          Every request stands alone. No spillover. No drift.
        </p>

        <div className="mt-10 flex justify-center">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-6 py-3 bg-black text-white rounded-lg text-sm font-medium hover:opacity-90 transition"
          >
            Enter EvenGround
          </Link>
        </div>
      </section>

      {/* Problem / Shift */}
      <section className="bg-gray-50 py-20 sm:py-24">
        <div className="max-w-5xl mx-auto px-6 sm:px-8 grid grid-cols-1 md:grid-cols-2 gap-12 sm:gap-16">

          <div>
            <h2 className="text-xl sm:text-2xl font-semibold mb-6">
              Without Structure
            </h2>

            <p className="text-gray-600 leading-relaxed mb-4 text-sm sm:text-base">
              A simple custody question turns into a debate about past behavior.
              An expense discussion reopens old resentment. Conversations
              expand beyond their original purpose.
            </p>

            <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
              Texting provides no boundaries — and no containment.
            </p>
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-semibold mb-6">
              With Segmentation
            </h2>

            <p className="text-gray-600 leading-relaxed mb-4 text-sm sm:text-base">
              EvenGround isolates each topic into its own structured request.
              Every exchange has a clear scope and a defined outcome.
            </p>

            <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
              Clarity replaces escalation. Decisions replace arguments.
            </p>
          </div>

        </div>
      </section>

      {/* Features */}
      <section className="py-20 sm:py-24">
        <div className="max-w-5xl mx-auto px-6 sm:px-8">

          <h2 className="text-xl sm:text-2xl font-semibold text-center mb-12 sm:mb-16">
            Designed To Prevent Escalation — Not Record It
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 sm:gap-14">

            <div>
              <h3 className="font-semibold mb-3">
                Structured Requests
              </h3>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                Custody swaps, schedule changes, and expenses are formalized
                into single-topic conversations with defined outcomes.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-3">
                Decision Lifecycle
              </h3>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                Every request moves through pending, approved, or declined —
                eliminating circular arguments and ambiguity.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-3">
                Tone Guard
              </h3>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                AI-powered guardrails flag escalatory language before
                messages are sent — reducing conflict before it begins.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-3">
                Shared Awareness
              </h3>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                Both parents see the same structured system —
                keeping coordination transparent and focused.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Closing */}
      <section className="bg-gray-900 text-white py-20 sm:py-24 text-center">
        <div className="max-w-3xl mx-auto px-6 sm:px-8">

          <h2 className="text-xl sm:text-2xl font-semibold">
            Structure Is The De-Escalation.
          </h2>

          <p className="mt-4 text-gray-300 text-sm sm:text-base leading-relaxed">
            When communication has boundaries, conflict has less room to grow.
          </p>

          <div className="mt-8">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-block px-6 py-3 bg-white text-black rounded-lg text-sm font-medium hover:opacity-90 transition"
            >
              Start Coordinating Calmly
            </Link>
          </div>

        </div>
      </section>

    </div>
  );
}