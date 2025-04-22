import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="h-screen flex flex-col items-center justify-center text-center space-y-4">
      <h1 className="text-6xl font-black">404</h1>
      <p>Oops! Page not found.</p>
      <Link to="/" className="text-regulatory-500 underline focus-visible:ring focus-visible:ring-regulatory-400">
        Return home
      </Link>
    </div>
  );
}