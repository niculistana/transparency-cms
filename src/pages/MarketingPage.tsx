import { Link } from "react-router-dom";

export function MarketingPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-6 py-12 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Welcome to Transparency CMS
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          A modern content management system built for transparency and
          collaboration.
        </p>
        <div className="space-x-4">
          <Link
            to="/login"
            className="inline-block px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Get Started
          </Link>
          <Link
            to="/home"
            className="inline-block px-8 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-colors duration-200"
          >
            Learn More
          </Link>
        </div>
      </div>
    </div>
  );
}
