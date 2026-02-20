export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center flex-1 text-center px-6">
        
        <h1 className="text-4xl font-bold mb-6">
          One Topic. One Decision.
        </h1>

        <p className="text-gray-600 max-w-xl mb-8">
          EvenGround brings structure, clarity, and respect to co-parenting communication.
          No emotional spirals. No messy text threads. Just calm, transactional decisions.
        </p>

        <div className="space-x-4">
          
          <a
            href="/signup"
            className="bg-black text-white px-6 py-3 rounded-lg"
          >
            Get Started
          </a>

          <a
            href="/login"
            className="border border-gray-300 px-6 py-3 rounded-lg"
          >
            Login
          </a>

        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-gray-400 pb-6">
        Calm. Structured. Neutral.
      </div>
    </div>
  );
}