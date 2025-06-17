import React from 'react';

export default function AuthLayout({ children = <DemoAuthForm /> }) {
  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      {/* Background with gradient overlay */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50"
        style={{
          backgroundImage: `
            radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, rgba(20, 184, 166, 0.1) 0%, transparent 50%),
            linear-gradient(135deg, rgba(248, 250, 252, 0.8) 0%, rgba(241, 245, 249, 0.9) 100%)
          `
        }}
      />
      
      {/* Decorative elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-r from-teal-400 to-blue-500 rounded-full opacity-10 blur-xl"></div>
      <div className="absolute bottom-10 right-10 w-32 h-32 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full opacity-10 blur-xl"></div>
      <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full opacity-10 blur-xl"></div>
      
      {/* Main content container */}
      <div className="relative w-full max-w-md">
        {/* Glassmorphism card */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 relative overflow-hidden">
          {/* Subtle inner glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent rounded-2xl"></div>
          
          {/* Content */}
          <div className="relative z-10">
            {children}
          </div>
        </div>
        
        {/* Subtle shadow beneath */}
        <div className="absolute inset-x-4 bottom-0 h-6 bg-gradient-to-r from-transparent via-gray-200/20 to-transparent blur-sm transform translate-y-2"></div>
      </div>
      
      {/* Animated floating elements */}
      <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-teal-400 rounded-full opacity-60 animate-pulse"></div>
      <div className="absolute bottom-1/3 left-1/3 w-1 h-1 bg-blue-400 rounded-full opacity-40 animate-ping" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-3/4 right-1/3 w-1.5 h-1.5 bg-purple-400 rounded-full opacity-50 animate-pulse" style={{ animationDelay: '2s' }}></div>
    </div>
  );
}