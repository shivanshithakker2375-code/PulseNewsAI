import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="bg-white border-t border-gray-200 mt-20 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                         <span className="font-serif font-bold text-xl tracking-tight text-gray-900">
                            Pulse<span className="text-accent-600">.</span>
                        </span>
                        <p className="text-sm text-gray-500 mt-2">
                            AI-powered news aggregation in real-time.
                        </p>
                    </div>
                    
                    <div className="flex gap-6 text-sm text-gray-600 font-medium">
                        <a href="#" className="hover:text-black">About</a>
                        <a href="#" className="hover:text-black">Privacy</a>
                        <a href="#" className="hover:text-black">Terms</a>
                        <a href="#" className="hover:text-black">Contact</a>
                    </div>
                </div>
                <div className="mt-8 text-center text-xs text-gray-400">
                    &copy; {new Date().getFullYear()} Pulse News AI. Generated content may produce inaccurate information.
                </div>
            </div>
        </footer>
    );
};

export default Footer;