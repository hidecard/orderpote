import { ShoppingBag, Zap, Shield, BarChart } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-purple-600">OrderPote</h1>
          <div className="space-x-4">
            <a href="/login" className="text-gray-600 hover:text-gray-800">
              Login
            </a>
            <a
              href="/register"
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Start Selling for Free
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Start Selling Online in Minutes
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            The easiest way to create product links, accept payments via mobile banking,
            and manage orders - all from one simple dashboard.
          </p>
          <a
            href="/register"
            className="inline-block bg-purple-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-purple-700 transition-colors"
          >
            Start Selling for Free
          </a>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Everything You Need to Sell Online
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <ShoppingBag className="w-12 h-12 text-purple-600 mb-4" />
            <h4 className="text-xl font-semibold mb-2">Product Links</h4>
            <p className="text-gray-600">
              Create unique product links and share them on social media instantly
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <Zap className="w-12 h-12 text-purple-600 mb-4" />
            <h4 className="text-xl font-semibold mb-2">Fast Checkout</h4>
            <p className="text-gray-600">
              Mobile-optimized checkout with Myanmar payment methods
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <Shield className="w-12 h-12 text-purple-600 mb-4" />
            <h4 className="text-xl font-semibold mb-2">Payment Verification</h4>
            <p className="text-gray-600">
              Screenshot verification for secure payment confirmation
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <BarChart className="w-12 h-12 text-purple-600 mb-4" />
            <h4 className="text-xl font-semibold mb-2">Analytics</h4>
            <p className="text-gray-600">
              Track sales, views, and performance with detailed analytics
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-purple-600 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">
            Ready to Start Selling?
          </h3>
          <p className="text-xl text-purple-100 mb-8">
            Join thousands of sellers using OrderPote today
          </p>
          <a
            href="/register"
            className="inline-block bg-white text-purple-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Get Started Free
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2026 OrderPote. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
