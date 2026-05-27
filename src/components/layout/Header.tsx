import { Bell, Search, Menu } from 'lucide-react';

interface HeaderProps {
  title: string;
  onMenuClick?: () => void;
}

export default function Header({ title, onMenuClick }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-100 px-4 py-4 md:px-8 md:py-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3 md:gap-4">
        <button 
          onClick={onMenuClick}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 text-gray-400 hover:text-brand-primary md:hidden"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="w-1 h-6 bg-brand-primary rounded-full hidden sm:block"></div>
        <h2 className="text-lg md:text-xl font-black text-brand-dark tracking-tight truncate">{title}</h2>
      </div>
      <div className="flex items-center gap-3 md:gap-6">
        <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-2xl border border-gray-100 text-gray-400">
          <Search className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-widest">Search...</span>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 hover:text-brand-primary transition-colors cursor-pointer relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-brand-primary/10 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-brand-primary animate-pulse"></div>
          </div>
        </div>
      </div>
    </header>
  );
}
