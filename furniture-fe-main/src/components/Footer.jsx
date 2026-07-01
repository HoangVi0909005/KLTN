import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-8 mt-12">
      <div className="max-w-7xl mx-auto px-4">
        <h3 className="font-bold text-xl mb-6 text-blue-400">🎯 Các Truy Vấn Được Demo:</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-300 border-b border-gray-700 pb-8 mb-6">
          <div className="flex items-center gap-2">✅ <span className="font-semibold text-white">Search:</span> LIKE với LOWER()</div>
          <div className="flex items-center gap-2">✅ <span className="font-semibold text-white">Best Selling:</span> JOIN + GROUP BY</div>
          <div className="flex items-center gap-2">✅ <span className="font-semibold text-white">High Rated:</span> HAVING + AVG</div>
          <div className="flex items-center gap-2">✅ <span className="font-semibold text-white">Statistics:</span> COUNT, SUM, AVG...</div>
          <div className="flex items-center gap-2">✅ <span className="font-semibold text-white">Price Range:</span> CASE WHEN logic</div>
          <div className="flex items-center gap-2">✅ <span className="font-semibold text-white">Low Stock:</span> WHERE logic</div>
        </div>
        <div className="text-center text-gray-500 text-xs">
          © {new Date().getFullYear()} Furniture Shop Project - Phát triển bởi Demo Truy Vấn.
        </div>
      </div>
    </footer>
  );
};

export default Footer;