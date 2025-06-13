const Navbar = () => {
    return (
        <nav className="flex items-center justify-between px-6 lg:px-12 py-6">
            <a className="flex items-center space-x-2" href='/'>
                <span className="text-xl font-inter">promodoro</span>
            </a>
            <div className="flex items-center space-x-3">
                <button className="px-3 py-1.5 text-sm bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 rounded-full transition-all duration-200 font-inter border border-gray-700 cursor-pointer">
                    Settings
                </button>
            </div>
        </nav>
    );
}

export default Navbar;

