import { ShoppingBag, Zap, Shield, BarChart, CheckCircle, ArrowRight, Smartphone, Clock } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="OrderPote Logo" className="h-10 w-auto" />
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-sm font-medium text-gray-600 hover:text-[#1a7f8c] transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-[#1a7f8c] transition-colors">How it Works</a>
            <a href="/login" className="text-sm font-medium text-gray-600 hover:text-[#1a7f8c] transition-colors">Login</a>
            <a
              href="/register"
              className="bg-[#1a7f8c] text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-[#156a75] transition-all shadow-sm hover:shadow-md"
            >
              Start Selling Free
            </a>
          </div>
          <div className="md:hidden">
             <a
              href="/register"
              className="bg-[#1a7f8c] text-white px-4 py-2 rounded-full text-sm font-semibold"
            >
              Get Started
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#1a7f8c]/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#f9a825]/5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1a7f8c]/10 text-[#1a7f8c] text-xs font-bold uppercase tracking-wider mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1a7f8c] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1a7f8c]"></span>
            </span>
            The Future of Social Commerce in Myanmar
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 mb-8 leading-[1.1]">
            Sell Online <span className="text-[#1a7f8c]">Easier</span> & <span className="text-[#f9a825]">Faster</span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            Create professional product links, accept mobile banking payments, and manage orders with a powerful dashboard designed for Myanmar sellers.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/register"
              className="w-full sm:w-auto bg-[#1a7f8c] text-white px-10 py-4 rounded-full text-lg font-bold hover:bg-[#156a75] transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              Start Selling for Free <ArrowRight className="w-5 h-5" />
            </a>
            <a
              href="#features"
              className="w-full sm:w-auto bg-white text-gray-700 border border-gray-200 px-10 py-4 rounded-full text-lg font-semibold hover:bg-gray-50 transition-all"
            >
              Explore Features
            </a>
          </div>
          
          {/* Hero Image/Mockup Placeholder */}
          <div className="mt-20 relative max-w-5xl mx-auto">
            <div className="rounded-2xl overflow-hidden shadow-2xl border border-gray-100 bg-gray-50 aspect-[16/9] flex items-center justify-center">
               <div className="text-center p-12">
                  <img src="/logo.png" alt="OrderPote Preview" className="h-32 w-auto mx-auto mb-6 opacity-20 grayscale" />
                  <p className="text-gray-400 font-medium">Interactive Dashboard Preview</p>
               </div>
            </div>
            {/* Floating elements */}
            <div className="absolute -top-6 -right-6 bg-white p-4 rounded-xl shadow-lg border border-gray-50 hidden md:block">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">New Order Received</p>
                  <p className="text-sm font-bold">#OP-9982 - 45,000 MMK</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Everything You Need to Scale</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Powerful tools built specifically for the Myanmar market, from payment verification to live order tracking.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-[#1a7f8c]/10 rounded-xl flex items-center justify-center text-[#1a7f8c] mb-6">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">Smart Product Links</h3>
              <p className="text-gray-600 leading-relaxed">
                Generate unique links for your products and share them on Facebook, Messenger, or Viber. No website needed.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-[#f9a825]/10 rounded-xl flex items-center justify-center text-[#f9a825] mb-6">
                <Zap className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">Fast Mobile Checkout</h3>
              <p className="text-gray-600 leading-relaxed">
                A seamless checkout experience optimized for mobile users. Quick, intuitive, and conversion-focused.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-6">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">Payment Verification</h3>
              <p className="text-gray-600 leading-relaxed">
                Built-in screenshot upload for KBZ Pay, Wave Pay, and more. Verify payments securely with one click.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 mb-6">
                <Clock className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">Live Digital Receipts</h3>
              <p className="text-gray-600 leading-relaxed">
                Customers get real-time updates on their order status. No more "Is my order shipped?" messages.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-green-50 rounded-xl flex items-center justify-center text-green-600 mb-6">
                <Smartphone className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">Mobile-First Design</h3>
              <p className="text-gray-600 leading-relaxed">
                Manage your entire business from your phone. Responsive dashboard for sellers on the go.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-red-50 rounded-xl flex items-center justify-center text-red-600 mb-6">
                <BarChart className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">Sales Analytics</h3>
              <p className="text-gray-600 leading-relaxed">
                Track your best-selling products, daily revenue, and customer trends with beautiful charts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Marketing Section: The Flow */}
      <section id="how-it-works" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">From Post to Profit in 3 Steps</h2>
              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#1a7f8c] text-white flex items-center justify-center font-bold">1</div>
                  <div>
                    <h4 className="text-xl font-bold mb-2">Create & Share</h4>
                    <p className="text-gray-600">Upload your product and get a custom link. Share it anywhere your customers are.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#1a7f8c] text-white flex items-center justify-center font-bold">2</div>
                  <div>
                    <h4 className="text-xl font-bold mb-2">Automated Checkout</h4>
                    <p className="text-gray-600">Customers fill their details and upload payment screenshots directly on your link.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#1a7f8c] text-white flex items-center justify-center font-bold">3</div>
                  <div>
                    <h4 className="text-xl font-bold mb-2">Verify & Ship</h4>
                    <p className="text-gray-600">Review orders in your dashboard, verify payments, and update shipping status instantly.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:w-1/2 bg-[#1a7f8c]/5 rounded-3xl p-8 border border-[#1a7f8c]/10">
               <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                  <div className="bg-[#1a7f8c] p-4 text-white flex justify-between items-center">
                    <span className="font-bold">Order Detail #OP-9982</span>
                    <span className="bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Pending</span>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Customer</span>
                      <span className="font-semibold">Ma Thandar</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Items</span>
                      <span className="font-semibold">Premium Cotton Tee (M) x 2</span>
                    </div>
                    <div className="pt-4 border-t border-gray-100">
                      <p className="text-xs text-gray-400 mb-2 uppercase font-bold">Payment Screenshot</p>
                      <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 italic text-sm">
                        [KBZ Pay Screenshot Preview]
                      </div>
                    </div>
                    <div className="flex gap-2 pt-4">
                      <button className="flex-1 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-bold">Reject</button>
                      <button className="flex-2 py-2 bg-green-600 text-white rounded-lg text-sm font-bold px-4">Mark as Paid & Ship</button>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#1a7f8c] rounded-[2rem] p-12 text-center text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#f9a825]/20 rounded-full -ml-32 -mb-32 blur-3xl"></div>
            
            <h2 className="text-3xl md:text-5xl font-bold mb-6 relative z-10">Ready to grow your business?</h2>
            <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto relative z-10">
              Join hundreds of Myanmar entrepreneurs who are simplifying their sales process with OrderPote.
            </p>
            <div className="relative z-10">
              <a
                href="/register"
                className="inline-block bg-white text-[#1a7f8c] px-10 py-4 rounded-full text-lg font-bold hover:bg-gray-100 transition-all shadow-lg"
              >
                Get Started for Free
              </a>
              <p className="mt-4 text-sm text-white/60">No credit card required. Setup in 2 minutes.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="OrderPote Logo" className="h-8 w-auto" />
            </div>
            <div className="flex gap-8 text-sm text-gray-500">
              <a href="#" className="hover:text-[#1a7f8c]">Privacy Policy</a>
              <a href="#" className="hover:text-[#1a7f8c]">Terms of Service</a>
              <a href="#" className="hover:text-[#1a7f8c]">Contact Us</a>
            </div>
            <p className="text-sm text-gray-400">&copy; 2026 OrderPote. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
