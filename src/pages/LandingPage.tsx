import { ShoppingBag, Shield, BarChart, CheckCircle, ArrowRight, Smartphone, Clock, MousePointer2, Share2, CreditCard } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="OrderPote Logo" className="h-12 w-auto" />
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-base font-medium text-gray-700 hover:text-[#1a7f8c] transition-colors">လုပ်ဆောင်ချက်များ</a>
            <a href="#how-it-works" className="text-base font-medium text-gray-700 hover:text-[#1a7f8c] transition-colors">အသုံးပြုပုံ</a>
            <a href="/login" className="text-base font-medium text-gray-700 hover:text-[#1a7f8c] transition-colors">အကောင့်ဝင်ရန်</a>
            <a
              href="/register"
              className="bg-[#1a7f8c] text-white px-6 py-2.5 rounded-lg text-base font-bold hover:bg-[#156a75] transition-all shadow-sm"
            >
              အခမဲ့စတင်ရောင်းချမည်
            </a>
          </div>
          <div className="md:hidden">
             <a
              href="/register"
              className="bg-[#1a7f8c] text-white px-4 py-2 rounded-lg text-sm font-bold"
            >
              စတင်မည်
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-16 pb-24 overflow-hidden bg-[#f8fbfc]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1a7f8c]/10 text-[#1a7f8c] text-sm font-bold mb-6">
                မြန်မာနိုင်ငံ၏ အကောင်းဆုံး Social Commerce Dashboard
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight text-gray-900 mb-6 leading-tight">
                အွန်လိုင်းမှာ ပစ္စည်းရောင်းရတာ <br/>
                <span className="text-[#1a7f8c]">ပိုမိုလွယ်ကူ မြန်ဆန်စေရမည်</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-10 leading-relaxed">
                Product Link များဖန်တီးပါ၊ Mobile Banking ဖြင့် ငွေပေးချေမှုများကို လက်ခံပါ၊ အော်ဒါများကို တစ်နေရာတည်းတွင် စနစ်တကျ စီမံခန့်ခွဲပါ။
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <a
                  href="/register"
                  className="w-full sm:w-auto bg-[#1a7f8c] text-white px-10 py-4 rounded-xl text-xl font-bold hover:bg-[#156a75] transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  အခမဲ့ စတင်အသုံးပြုမည် <ArrowRight className="w-6 h-6" />
                </a>
                <div className="flex items-center gap-2 text-gray-500 font-medium">
                  <CheckCircle className="w-5 h-5 text-green-500" /> Credit Card မလိုပါ
                </div>
              </div>
            </div>
            <div className="lg:w-1/2 relative">
              <div className="bg-white p-4 rounded-3xl shadow-2xl border border-gray-100">
                <img src="/logo.png" alt="OrderPote App" className="w-full h-auto rounded-2xl opacity-10 grayscale py-20" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center w-full">
                   <p className="text-[#1a7f8c] font-bold text-xl">OrderPote Dashboard</p>
                   <p className="text-gray-400">အော်ဒါစီမံခန့်ခွဲမှုစနစ်</p>
                </div>
              </div>
              {/* Floating Status Cards */}
              <div className="absolute -top-6 -right-6 bg-white p-4 rounded-2xl shadow-xl border border-gray-50 animate-bounce-slow">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-bold">အော်ဒါအသစ်ရရှိသည်</p>
                    <p className="text-sm font-black">၄၅,၀၀၀ ကျပ်</p>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl border border-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                    <Shield className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-bold">ငွေလွှဲမှု စစ်ဆေးပြီး</p>
                    <p className="text-sm font-black text-blue-600">KBZ Pay - အောင်မြင်သည်</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl md:text-4xl font-black text-[#1a7f8c]">၅၀၀+</p>
              <p className="text-gray-500 font-bold">ရောင်းချသူများ</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-black text-[#1a7f8c]">၁၀,၀၀၀+</p>
              <p className="text-gray-500 font-bold">အော်ဒါများ</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-black text-[#1a7f8c]">၂၄/၇</p>
              <p className="text-gray-500 font-bold">ဝန်ဆောင်မှု</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-black text-[#1a7f8c]">၁၀၀%</p>
              <p className="text-gray-500 font-bold">စိတ်ချရမှု</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">လုပ်ငန်းတိုးတက်ဖို့ လိုအပ်သမျှ အားလုံး</h2>
            <p className="text-gray-600 max-w-2xl mx-auto font-medium">မြန်မာရောင်းချသူများအတွက် အထူးထုတ်လုပ်ထားသော လုပ်ဆောင်ချက်များ</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <FeatureCard 
              icon={<Share2 className="w-8 h-8" />}
              title="Product Link များ"
              description="မိမိပစ္စည်းအတွက် သီးသန့် Link ဖန်တီးပြီး Facebook, Messenger တို့တွင် တိုက်ရိုက်မျှဝေနိုင်ပါသည်။"
              color="bg-blue-50 text-blue-600"
            />
            <FeatureCard 
              icon={<MousePointer2 className="w-8 h-8" />}
              title="လွယ်ကူသော Checkout"
              description="ဝယ်ယူသူများအတွက် ဖုန်းဖြင့် အလွယ်တကူ အော်ဒါတင်နိုင်မည့် စနစ်ဖြစ်ပါသည်။"
              color="bg-orange-50 text-orange-600"
            />
            <FeatureCard 
              icon={<CreditCard className="w-8 h-8" />}
              title="ငွေလွှဲမှု စစ်ဆေးခြင်း"
              description="KBZ Pay, Wave Pay Screenshot များကို စနစ်တကျ စစ်ဆေးနိုင်မည့် လုပ်ဆောင်ချက် ပါဝင်ပါသည်။"
              color="bg-green-50 text-green-600"
            />
            <FeatureCard 
              icon={<Clock className="w-8 h-8" />}
              title="Live အော်ဒါ အခြေအနေ"
              description="ပစ္စည်းပို့လိုက်ပြီလား၊ ငွေလွှဲပြီးပြီလား ဆိုတာကို ဝယ်သူက Live ကြည့်ရှုနိုင်ပါသည်။"
              color="bg-purple-50 text-purple-600"
            />
            <FeatureCard 
              icon={<Smartphone className="w-8 h-8" />}
              title="ဖုန်းဖြင့် စီမံခန့်ခွဲနိုင်မှု"
              description="ဘယ်နေရာရောက်ရောက် ဖုန်းတစ်လုံးရှိရုံဖြင့် လုပ်ငန်းတစ်ခုလုံးကို စီမံနိုင်ပါသည်။"
              color="bg-pink-50 text-pink-600"
            />
            <FeatureCard 
              icon={<BarChart className="w-8 h-8" />}
              title="အရောင်းစာရင်းများ"
              description="နေ့စဉ်၊ လစဉ် အရောင်းစာရင်းများကို ဇယားများဖြင့် အသေးစိတ် ကြည့်ရှုနိုင်ပါသည်။"
              color="bg-red-50 text-red-600"
            />
          </div>
        </div>
      </section>

      {/* How it Works - The Flow */}
      <section id="how-it-works" className="py-24 bg-[#f8fbfc]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">အသုံးပြုပုံ အဆင့်ဆင့်</h2>
            <p className="text-gray-600 font-medium">မိနစ်ပိုင်းအတွင်း စတင်ရောင်းချနိုင်ပါသည်</p>
          </div>

          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2 space-y-10">
              <StepItem 
                number="၁"
                title="ပစ္စည်းတင်ပြီး Link ယူပါ"
                description="ရောင်းချမည့် ပစ္စည်းအချက်အလက်များကို ဖြည့်သွင်းပြီး Product Link ကို ရယူပါ။"
              />
              <StepItem 
                number="၂"
                title="ဝယ်သူက အော်ဒါတင်ပါမည်"
                description="ဝယ်သူက Link မှတစ်ဆင့် အချက်အလက်များဖြည့်ပြီး ငွေလွှဲ Screenshot တင်ပါမည်။"
              />
              <StepItem 
                number="၃"
                title="စစ်ဆေးပြီး ပစ္စည်းပို့ပါ"
                description="Dashboard မှတစ်ဆင့် ငွေလွှဲမှုကို စစ်ဆေးပြီး ပစ္စည်းပို့ဆောင်ပေးလိုက်ရုံပါပဲ။"
              />
            </div>
            <div className="lg:w-1/2">
               <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
                  <div className="bg-[#1a7f8c] p-5 text-white flex justify-between items-center">
                    <span className="font-bold text-lg">အော်ဒါအသေးစိတ် #OP-9982</span>
                    <span className="bg-yellow-400 text-yellow-900 text-xs font-black px-3 py-1 rounded-full uppercase">စစ်ဆေးရန်</span>
                  </div>
                  <div className="p-8 space-y-6">
                    <div className="flex justify-between items-center border-b border-gray-50 pb-4">
                      <span className="text-gray-500 font-bold">ဝယ်သူအမည်</span>
                      <span className="font-black text-gray-900">မသန္တာ</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-gray-50 pb-4">
                      <span className="text-gray-500 font-bold">မှာယူသည့်ပစ္စည်း</span>
                      <span className="font-black text-gray-900">Premium Cotton Tee (M) x 2</span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-3 uppercase font-black tracking-wider">ငွေလွှဲဖြတ်ပိုင်း (Screenshot)</p>
                      <div className="w-full h-48 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 italic font-medium">
                        [KBZ Pay Screenshot Preview]
                      </div>
                    </div>
                    <div className="flex gap-3 pt-4">
                      <button className="flex-1 py-3.5 border-2 border-red-100 text-red-600 rounded-xl font-black hover:bg-red-50 transition-colors">ပယ်ဖျက်မည်</button>
                      <button className="flex-[2] py-3.5 bg-green-600 text-white rounded-xl font-black hover:bg-green-700 shadow-lg shadow-green-200 transition-all">ငွေလက်ခံရရှိပြီး ပစ္စည်းပို့မည်</button>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#1a7f8c] rounded-[3rem] p-12 md:p-20 text-center text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#f9a825]/20 rounded-full -ml-48 -mb-48 blur-3xl"></div>
            
            <h2 className="text-3xl md:text-5xl font-black mb-8 relative z-10 leading-tight">သင့်လုပ်ငန်းကို ဒီနေ့ပဲ <br/> အဆင့်မြှင့်တင်လိုက်ပါ</h2>
            <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto relative z-10 font-medium">
              OrderPote ကို အသုံးပြုပြီး ရောင်းအားတွေကို စနစ်တကျနဲ့ ပိုမိုတိုးတက်အောင် လုပ်ဆောင်လိုက်ပါ။
            </p>
            <div className="relative z-10">
              <a
                href="/register"
                className="inline-block bg-white text-[#1a7f8c] px-12 py-5 rounded-2xl text-2xl font-black hover:bg-gray-50 transition-all shadow-xl hover:scale-105 transform"
              >
                အခမဲ့ စတင်အသုံးပြုမည်
              </a>
              <p className="mt-6 text-sm text-white/70 font-bold">မှတ်ပုံတင်ရန် ၂ မိနစ်သာ ကြာမြင့်ပါမည်။</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="flex flex-col items-center md:items-start gap-4">
              <img src="/logo.png" alt="OrderPote Logo" className="h-12 w-auto" />
              <p className="text-gray-500 font-medium max-w-xs text-center md:text-left">မြန်မာရောင်းချသူများအတွက် အကောင်းဆုံး အော်ဒါစီမံခန့်ခွဲမှုစနစ်</p>
            </div>
            <div className="flex flex-wrap justify-center gap-8 text-base font-bold text-gray-600">
              <a href="#" className="hover:text-[#1a7f8c]">ကိုယ်ရေးအချက်အလက် မူဝါဒ</a>
              <a href="#" className="hover:text-[#1a7f8c]">စည်းကမ်းသတ်မှတ်ချက်များ</a>
              <a href="#" className="hover:text-[#1a7f8c]">ဆက်သွယ်ရန်</a>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-50 text-center text-gray-400 font-medium">
            <p>&copy; ၂၀၂၆ OrderPote. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description, color }: { icon: React.ReactNode, title: string, description: string, color: string }) {
  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className={`w-16 h-16 ${color} rounded-2xl flex items-center justify-center mb-6 shadow-inner`}>
        {icon}
      </div>
      <h3 className="text-2xl font-black mb-4 text-gray-900">{title}</h3>
      <p className="text-gray-600 leading-relaxed font-medium">
        {description}
      </p>
    </div>
  );
}

function StepItem({ number, title, description }: { number: string, title: string, description: string }) {
  return (
    <div className="flex gap-6 group">
      <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-[#1a7f8c] text-white flex items-center justify-center text-2xl font-black shadow-lg shadow-[#1a7f8c]/20 group-hover:scale-110 transition-transform">
        {number}
      </div>
      <div>
        <h4 className="text-2xl font-black mb-2 text-gray-900">{title}</h4>
        <p className="text-gray-600 font-medium leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
