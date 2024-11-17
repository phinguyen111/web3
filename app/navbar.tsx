"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Menu, X } from "lucide-react";
import { useRouter } from "next/navigation";

const Navbar: React.FC = () => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmedInput = searchInput.trim();
    if (trimmedInput) {
      setIsLoading(true);
      try {
        // Check if the input is a valid transaction hash
        if (/^0x[a-fA-F0-9]{64}$/.test(trimmedInput)) {
          // Redirect to transaction details page
          router.push(`/transaction/${encodeURIComponent(trimmedInput)}`);
        } else {
          // Otherwise, assume it's a wallet address
          // Call API to fetch transactions for the wallet address
          const response = await fetch(`/api/transactions?address=${encodeURIComponent(trimmedInput)}`);
          const data = await response.json();

          if (data.success) {
            // Redirect to wallet address page if successful
            router.push(`/wallet_address?address=${encodeURIComponent(trimmedInput)}`);
          } else {
            console.error("Error fetching transactions:", data.message);
            alert("Error fetching wallet data. Please try again.");
          }
        }
      } catch (error) {
        console.error("Error:", error);
        alert("Error fetching data. Please try again.");
      } finally {
        setIsLoading(false);
      }
      setSearchInput(""); // Clear the input after search
    }
  };

  return (
    <nav className="bg-[#161A20] text-[#FFFFFF] shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Image
                src="/fullogo.svg"
                alt="JBIZ Logo"
                width={60}
                height={80}
                className="mr-2"
              />
            </Link>
          </div>

          {/* Navigation Links (Desktop) */}
          <div className="hidden md:flex flex-1 justify-evenly items-center font-quantico text-[#FFFFFF]">
            <Link href="/" className="hover:text-[#F5B056]">Home</Link>
            <Link href="/transaction" className="hover:text-[#F5B056]">Transaction</Link>
            <Link href="/aboutus" className="hover:text-[#F5B056]">About us</Link>
          </div>

          {/* Search Bar (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-xl ml-8">
            <form onSubmit={handleSearch} className="relative font-quantico w-full">
              <input
                type="text"
                placeholder="Search Wallet Address or Txn Hash"
                className="w-full py-2 pl-10 pr-4 text-gray-700 bg-gray-100 rounded-full focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#F5B056]"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                disabled={isLoading}
              />
              <button 
                type="submit" 
                className="absolute inset-y-0 left-0 flex items-center pl-3"
                disabled={isLoading}
              >
                <Search className={`h-5 w-5 text-gray-500 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </form>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-[#F5B056] hover:text-[#FFFFFF] focus:outline-none"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 font-quantico text-[#FFFFFF]">
              <Link href="/" className="block hover:text-[#F5B056]">Home</Link>
              <Link href="/transaction" className="block hover:text-[#F5B056]">Transaction</Link>
              <Link href="/aboutus" className="block hover:text-[#F5B056]">About us</Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;