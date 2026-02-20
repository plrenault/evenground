"use client";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div>
        <h1 className="text-2xl font-semibold mb-4">
          Welcome to EvenGround
        </h1>
        <div className="space-x-4">
          <a href="/login" className="underline">
            Login
          </a>
          <a href="/signup" className="underline">
            Sign Up
          </a>
        </div>
      </div>
    </div>
  );
}