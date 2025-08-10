import React from "react";

function Navbar() {
  return (
    <div className="h-[70px] bg-gray-950 border-b border-gray-800 px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-full">
        <div className="flex items-center space-x-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-purple-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <h1 className="text-white text-2xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text">
            AI Image Generator
          </h1>
        </div>
      </div>
    </div>
  );
}

export default Navbar;
