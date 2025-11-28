import { Search, Bell } from 'lucide-react';

export default function Header() {
    return (
        <header className="bg-black/80 backdrop-blur-md border-b border-white/10 h-20 flex items-center justify-between px-6 sm:px-8 sticky top-0 z-40 transition-all duration-300">
            <div className="flex-1 flex justify-between items-center">
                <div className="flex-1 flex max-w-2xl">
                    {/* Search bar */}
                    <div className="w-full max-w-lg">
                        <label htmlFor="search" className="sr-only">
                            Search
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                            </div>
                            <input
                                id="search"
                                name="search"
                                className="block w-full pl-11 pr-4 py-3 border border-white/10 rounded-xl leading-5 bg-white/5 text-gray-300 placeholder-gray-500 focus:outline-none focus:bg-white/10 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 sm:text-sm transition-all duration-200 ease-out shadow-sm"
                                placeholder="Search campaigns, scripts, or ideas..."
                                type="search"
                            />
                        </div>
                    </div>
                </div>
                <div className="ml-4 flex items-center md:ml-6 gap-4">
                    <button className="bg-white/5 p-2.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-purple-500 transition-all duration-200 relative group">
                        <span className="sr-only">View notifications</span>
                        <Bell className="h-6 w-6 group-hover:animate-swing" />
                        <span className="absolute top-2.5 right-3 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-black animate-pulse"></span>
                    </button>
                    <div className="h-8 w-px bg-white/10 mx-2"></div>
                </div>
            </div>
        </header>
    );
}
