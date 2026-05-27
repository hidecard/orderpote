import { ShoppingBag, ArrowRight, Smartphone, LayoutDashboard, Globe, ShieldCheck, ChevronRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-brand-primary selection:text-brand-dark">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img src="/real-logo.png" alt="ZayLink Logo" className="h-10 w-auto" />
            <span className="text-xl font-black text-brand-dark tracking-tighter hidden sm:block">Zay<span className="text-brand-primary">Link</span></span>
          </div>
          <div className="hidden md:flex items-center space-x-10">
            <a href="#features" className="text-xs font-black text-gray-400 hover:text-brand-primary transition-colors tracking-widest uppercase">Features</a>
            <a href="#how-it-works" className="text-xs font-black text-gray-400 hover:text-brand-primary transition-colors tracking-widest uppercase">Process</a>
            <a href="/login" className="text-xs font-black text-brand-dark hover:text-brand-primary transition-colors tracking-widest uppercase">Login</a>
            <a
              href="/register"
              className="bg-brand-primary text-brand-dark px-8 py-3 rounded-full text-xs font-black hover:bg-brand-dark hover:text-white transition-all shadow-xl shadow-brand-primary/20 hover:scale-105 active:scale-95 transform"
            >
              Get Started
            </a>
          </div>
          <a
            href="/register"
            className="md:hidden bg-brand-primary text-brand-dark px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest"
          >
            Start Now
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden bg-gray-50/50">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-brand-dark/5 -skew-x-12 translate-x-1/4"></div>
        
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-100 shadow-sm text-brand-primary text-[10px] font-black tracking-widest uppercase mb-8">
                <span className="flex h-2 w-2 rounded-full bg-brand-primary animate-pulse"></span>
                Social Commerce Platform
              </div>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-brand-dark mb-8 leading-[0.95]">
                အရောင်းအဝယ်ကို <br/>
                <span className="text-brand-primary underline decoration-brand-dark/10 underline-offset-8">Link တစ်ခုတည်း</span> <br/>
                ဖြင့် စီမံပါ
              </h1>
              <p className="text-lg text-gray-500 mb-12 leading-relaxed max-w-xl font-medium">
                ZayLink သည် မြန်မာအွန်လိုင်းရောင်းချသူများအတွက် Product Link များဖန်တီးခြင်း၊ ငွေပေးချေမှုစစ်ဆေးခြင်းနှင့် အော်ဒါစီမံခြင်းတို့ကို တစ်နေရာတည်းတွင် Pro ဆန်ဆန် လုပ်ဆောင်နိုင်မည့် စနစ်ဖြစ်ပါသည်။
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <a
                  href="/register"
                  className="w-full sm:w-auto bg-brand-dark text-white px-12 py-5 rounded-2xl text-lg font-black hover:bg-brand-primary hover:text-brand-dark transition-all shadow-2xl shadow-brand-dark/20 flex items-center justify-center gap-3 group"
                >
                  အခမဲ့စတင်မည် <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </a>
                <div className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-white border border-gray-100 shadow-sm">
                  <div className="flex -space-x-2">
                    {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-brand-primary/20"></div>)}
                  </div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">၅၀၀+ Sellers Trusted</p>
                </div>
              </div>
            </div>

            <div className="lg:w-1/2 relative">
              <div className="relative z-10 p-4 bg-white rounded-[3rem] shadow-3xl shadow-brand-dark/10 border border-gray-100">
                <div className="bg-brand-dark rounded-[2.5rem] p-8 overflow-hidden relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                  <div className="relative z-10 flex justify-between items-start mb-20">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md">
                      <LayoutDashboard className="w-6 h-6 text-brand-primary" />
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Weekly Sales</p>
                      <p className="text-2xl font-black text-white">+၁,၂၅၀,၀၀၀</p>
                    </div>
                  </div>
                  <div className="relative z-10 space-y-4">
                    {[1,2].map(i => (
                      <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between backdrop-blur-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-brand-primary/20 flex items-center justify-center text-brand-primary">
                            <ShoppingBag className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-black text-white">Order #OP-998{i}</p>
                            <p className="text-[8px] font-bold text-white/40">Success</p>
                          </div>
                        </div>
                        <p className="text-xs font-black text-brand-primary">၂၅,၀၀၀ ကျပ်</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-primary/20 rounded-full blur-3xl -z-10"></div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-brand-primary/20 rounded-full blur-3xl -z-10"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end gap-10 mb-20">
            <div className="max-w-2xl">
              <h2 className="text-sm font-black text-brand-primary uppercase tracking-[0.3em] mb-6">Capabilities</h2>
              <h3 className="text-4xl md:text-5xl font-black text-brand-dark tracking-tighter leading-tight">
                လုပ်ငန်းတိုးတက်ဖို့ လိုအပ်တဲ့ <br/> နည်းပညာများအားလုံး
              </h3>
            </div>
            <p className="text-gray-500 font-medium max-w-xs">
              ZayLink သည် သင့်လုပ်ငန်းကို အချိန်တိုအတွင်း Professional ဆန်သွားစေမည့် Tools များစွာ ပါဝင်ပါသည်။
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Globe className="w-7 h-7" />}
              title="Professional Link"
              description="သင့်ပစ္စည်းများကို Facebook ပေါ်တွင် Professional ဆန်ဆန် မျှဝေနိုင်မည့် Link များ ရရှိပါမည်။"
            />
            <FeatureCard 
              icon={<ShieldCheck className="w-7 h-7" />}
              title="Payment Check"
              description="KBZ Pay, Wave Pay Screenshot များကို Dashboard တစ်ခုတည်းတွင် အလွယ်တကူ စစ်ဆေးနိုင်ပါသည်။"
            />
            <FeatureCard 
              icon={<Smartphone className="w-7 h-7" />}
              title="Mobile First"
              description="ဖုန်းတစ်လုံးရှိရုံဖြင့် ဘယ်နေရာကမဆို အော်ဒါများကို အမြန်ဆုံး စီမံခန့်ခွဲနိုင်ပါသည်။"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto bg-brand-dark rounded-[3.5rem] p-12 md:p-24 relative overflow-hidden text-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(132,204,22,0.15)_0%,transparent_70%)]"></div>
          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tighter">သင့်လုပ်ငန်းကို ဒီနေ့ပဲ စတင်လိုက်ပါ</h2>
            <p className="text-lg text-white/60 mb-12 max-w-xl mx-auto font-medium">
              ZayLink PRO Edition ဖြင့် အရောင်းအဝယ်တွေကို စနစ်တကျနဲ့ ပိုမိုတိုးတက်အောင် လုပ်ဆောင်လိုက်ပါ။
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <a
                href="/register"
                className="w-full sm:w-auto bg-brand-primary text-brand-dark px-16 py-6 rounded-2xl text-xl font-black hover:bg-white transition-all shadow-2xl shadow-brand-primary/20 hover:scale-105 active:scale-95 transform"
              >
                အခမဲ့အကောင့်ဖွင့်မည်
              </a>
              <a href="/login" className="text-white font-black uppercase tracking-widest text-xs hover:text-brand-primary transition-colors flex items-center gap-2">
                Login to account <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-12">
            <div className="flex items-center gap-2">
              <img src="/real-logo.png" alt="ZayLink Logo" className="h-8 w-auto" />
              <h1 className="text-xl font-black text-brand-dark tracking-tighter">Zay<span className="text-brand-primary">Link</span></h1>
            </div>
            <div className="flex flex-wrap justify-center gap-10 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
              <a href="#" className="hover:text-brand-primary transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-brand-primary transition-colors">Terms of Use</a>
              <a href="#" className="hover:text-brand-primary transition-colors">Contact Support</a>
            </div>
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">&copy; ၂၀၂၆ ZayLink. PRO VERSION.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-10 rounded-[2.5rem] bg-gray-50 border border-gray-100 hover:border-brand-primary transition-all duration-500 group">
      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:bg-brand-primary group-hover:text-brand-dark transition-all duration-500">
        {icon}
      </div>
      <h3 className="text-2xl font-black mb-4 text-brand-dark tracking-tight">{title}</h3>
      <p className="text-gray-500 leading-relaxed font-medium text-sm">
        {description}
      </p>
    </div>
  );
}
