'use client';
import { useState } from "react";
import { Bell, Search, Settings } from "lucide-react";
import SettingsDropdown from "../ui/SettingsDropdown";
import { useSession } from "next-auth/react";
import Notification from "../ui/Notification";

export default function Header({}) {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: session, status } = useSession();


  return (
    // {/* Header */}
    <div className="bg-white shadow-sm border-b">
      <div className="flex items-center justify-between px-8 py-3.5">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search Property here..."
              className="pl-10 pr-4 py-2 border placeholder-gray-300 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
                    {/* <button className="p-2 text-gray-400 hover:text-gray-600"> */}
        <Notification />
          {/* </button> */}
         <SettingsDropdown />
        </div>
      </div>
    </div>
  );
}