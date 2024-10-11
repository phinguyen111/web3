'use client'

import { useState, useEffect, useCallback } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from 'next/link'
import Image from 'next/image'
import { Eye, ArrowUpDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Download, Copy, Facebook, Twitter, Instagram, Send, MessageCircle, Youtube } from 'lucide-react'
import { toast } from "@/components/ui/use-toast"


// Custom icon components
const handleDownload = () => {
  // Implement download functionality
  console.log('Downloading page data...')
}

const CopyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 0H2C0.9 0 0 0.9 0 2V12H2V2H12V0ZM14 4H5C3.9 4 3 4.9 3 6V16H14C15.1 16 16 15.1 16 14V6C16 4.9 15.1 4 14 4ZM14 14H5V6H14V14Z" fill="#A0AEC0" />
  </svg>
)

const ArrowIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 0C3.6 0 0 3.6 0 8C0 12.4 3.6 16 8 16C12.4 16 16 12.4 16 8C16 3.6 12.4 0 8 0ZM12 8.6L9.4 11.2L8 9.8L9.8 8H4V6H9.8L8 4.2L9.4 2.8L12 5.4C12.4 5.8 12.4 6.2 12 6.6V8.6Z" fill="#A0AEC0" />
  </svg>
)

// Mock transaction data
const transactions = [
  { hash: '0x02bJ97ca75...', method: 'Transfer', block: '050505', age: '5 secs ago', from: '0x0496A61A1...J97500BC', to: '0x308C3F1...B0505CaF5b2d', amount: '5,000,000 JCO', fee: '0.050505' },
  { hash: '0xeb2eba1ac2...', method: 'Transfer', block: '050505', age: '5 secs ago', from: '0xA7B72cJ97...8E54d0d', to: '0xdA1958D...C13D831ec71102', amount: '150 JCO', fee: '0.0001102' },
  { hash: '0xJ97BocCon5t...', method: 'Claim', block: '050505', age: '5 secs ago', from: '0xJaK5tR1EuY...43J09d9k', to: '0xdKeV05b...51kRrD3ec3505', amount: '5050 JCO', fee: '0.05051102' },
  { hash: '0x8eS0lcOnJ97...', method: 'Execute', block: '050505', age: '5 secs ago', from: '0xA7R12cJ97...R1kR7d0d', to: '0xdA1958D...C13D831ec71102', amount: '5,000 JCO', fee: '0.5000000' },
  { hash: '0x8J9750Of32c...', method: 'Transfer', block: '050505', age: '5 secs ago', from: '0xA7R12cJ97...R1kR7d0d', to: '0xdA1958D...C13D831ec71102', amount: '5,000 JCO', fee: '0.5000000' },
  { hash: '0x02bJ97ca75...', method: 'Transfer', block: '050505', age: '5 secs ago', from: '0x0496A61A1...J97500BC', to: '0x308C3F1...B0505CaF5b2d', amount: '5,000,000 JCO', fee: '0.050505' },
  { hash: '0xeb2eba1ac2...', method: 'Transfer', block: '050505', age: '5 secs ago', from: '0xA7B72cJ97...8E54d0d', to: '0xdA1958D...C13D831ec71102', amount: '150 JCO', fee: '0.0001102' },
  { hash: '0xeb2eba1ac2...', method: 'Transfer', block: '050505', age: '5 secs ago', from: '0xA7B72cJ97...8E54d0d', to: '0xdA1958D...C13D831ec71102', amount: '150 JCO', fee: '0.0001102' },
  { hash: '0xJ97BocCon5t...', method: 'Claim', block: '050505', age: '5 secs ago', from: '0xJaK5tR1EuY...43J09d9k', to: '0xdKeV05b...51kRrD3ec3505', amount: '5050 JCO', fee: '0.05051102' },
  { hash: '0x890255f32c...', method: 'Execute', block: '050505', age: '5 secs ago', from: '0xA7R12cJ97...R1kR7d0d', to: '0xdA1958D...C13D831ec71102', amount: '5,000 JCO', fee: '0.5000000' },
  { hash: '0x8J9750Of32c...', method: 'Transfer', block: '050505', age: '5 secs ago', from: '0xA7R12cJ97...R1kR7d0d', to: '0xdA1958D...C13D831ec71102', amount: '5,000 JCO', fee: '0.5000000' },
  { hash: '0x02bJ97ca75...', method: 'Transfer', block: '050505', age: '5 secs ago', from: '0x0496A61A1...J97500BC', to: '0x308C3F1...B0505CaF5b2d', amount: '5,000,000 JCO', fee: '0.050505' },
  { hash: '0xeb2eba1ac2...', method: 'Transfer', block: '050505', age: '5 secs ago', from: '0xA7B72cJ97...8E54d0d', to: '0xdA1958D...C13D831ec71102', amount: '150 JCO', fee: '0.0001102' },
  { hash: '0x8J9750Of32c...', method: 'Transfer', block: '050505', age: '5 secs ago', from: '0xA7R12cJ97...R1kR7d0d', to: '0xdA1958D...C13D831ec71102', amount: '5,000 JCO', fee: '0.5000000' },
  { hash: '0x02bJ97ca75...', method: 'Transfer', block: '050505', age: '5 secs ago', from: '0x0496A61A1...J97500BC', to: '0x308C3F1...B0505CaF5b2d', amount: '5,000,000 JCO', fee: '0.050505' },
  { hash: '0xJ97BocCon5t...', method: 'Claim', block: '050505', age: '5 secs ago', from: '0xJaK5tR1EuY...43J09d9k', to: '0xdKeV05b...51kRrD3ec3505', amount: '5050 JCO', fee: '0.05051102' },
  { hash: '0x890255f32c...', method: 'Execute', block: '050505', age: '5 secs ago', from: '0xA7R12cJ97...R1kR7d0d', to: '0xdA1958D...C13D831ec71102', amount: '5,000 JCO', fee: '0.5000000' },
  { hash: '0x8J9750Of32c...', method: 'Transfer', block: '050505', age: '5 secs ago', from: '0xA7R12cJ97...R1kR7d0d', to: '0xdA1958D...C13D831ec71102', amount: '5,000 JCO', fee: '0.5000000' },
  { hash: '0x02bJ97ca75...', method: 'Transfer', block: '050505', age: '5 secs ago', from: '0x0496A61A1...J97500BC', to: '0x308C3F1...B0505CaF5b2d', amount: '5,000,000 JCO', fee: '0.050505' },
  { hash: '0xeb2eba1ac2...', method: 'Transfer', block: '050505', age: '5 secs ago', from: '0xA7B72cJ97...8E54d0d', to: '0xdA1958D...C13D831ec71102', amount: '150 JCO', fee: '0.0001102' },
  { hash: '0x8J9750Of32c...', method: 'Transfer', block: '050505', age: '5 secs ago', from: '0xA7R12cJ97...R1kR7d0d', to: '0xdA1958D...C13D831ec71102', amount: '5,000 JCO', fee: '0.5000000' },
  { hash: '0x02bJ97ca75...', method: 'Transfer', block: '050505', age: '5 secs ago', from: '0x0496A61A1...J97500BC', to: '0x308C3F1...B0505CaF5b2d', amount: '5,000,000 JCO', fee: '0.050505' },

]

export default function TransactionExplorer() {
  // State variables
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null)
  const totalPages = 5000
  const [isMobile, setIsMobile] = useState(false)

  // Effect to handle responsive design
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // Set the initial value
    handleResize()

    // Add event listener
    window.addEventListener('resize', handleResize)

    // Clean up
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied to clipboard",
        description: "The text has been copied to your clipboard.",
      })
    }).catch((err) => {
      console.error('Failed to copy: ', err)
      toast({
        title: "Failed to copy",
        description: "An error occurred while copying the text.",
        variant: "destructive",
      })
    })
  }


  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    // Fetch new data for the selected page
  }


  const formatAmount = (amount: string) => {
    const [value, currency] = amount.split(' ')
    const formattedValue = Number(value.replace(/,/g, '')).toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
    return `${formattedValue} ${currency}`
  }
  const formatFee = (fee: string) => {
    // Convert the fee to a number, then to a fixed-point notation with 6 decimal places
    return Number(parseFloat(fee).toFixed(6)).toString()
  }

  const handleDownload = () => {
    // Create CSV content
    const headers = ['Transaction Hash', 'Method', 'Block', 'Age', 'From', 'To', 'Amount', 'Txn Fee']
    const csvContent = [
      headers.join(','),
      ...transactions.map(tx =>
        [
          tx.hash,
          tx.method,
          tx.block,
          tx.age,
          tx.from,
          tx.to,
          formatAmount(tx.amount).replace(/,/g, ''), // Remove commas for CSV 
          // Format the fee to always show 10 decimal places
          formatFee(tx.fee)
        ].join(',')
      )
    ].join('\n')

    // Create Blob and download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', 'transaction_data.csv')
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleMethodClick = (method: string) => {
    setSelectedMethod(method === selectedMethod ? null : method)
  }

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  useEffect(() => {
    const backToTopButton = document.getElementById('back-to-top')
    if (backToTopButton) {
      backToTopButton.addEventListener('click', scrollToTop)
    }

    return () => {
      if (backToTopButton) {
        backToTopButton.removeEventListener('click', scrollToTop)
      }
    }
  }, [scrollToTop])



  return (
    //Boxes that displays the overall information about the crypto marketplace
    <div className="min-h-screen bg-[#1C2128] text-white font-exo2">
      {/* Header section */}
      <div className="container mx-auto p-4">
        <div className="flex flex-col md:flex-row justify-between items-center py-4 border-b border-gray-700">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 md:mb-0">Transactions</h1>
          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4">
            <span className="text-[#4caf50] font-quantico">JCO: $5,000,000 (+1.25%)</span>
            <span className="flex items-center">
              Gas: 9.592 Gwei
            </span>
          </div>
        </div>

        {/* Statistics cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-6">
          <Card className="bg-gray-100 border rounded-2xl font-quantico">
            <CardHeader>
              <CardTitle className="text-xl text-center text-gray-600 font-quantico">Transactions (24h)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl text-center font-bold text-black font-quantico" >5,000,000</p>
              <p className="text-green-500 text-sm text-center">-3.55%</p>
            </CardContent>
          </Card>
          <Card className="bg-white border rounded-2xl font-quantico">
            <CardHeader>
              <CardTitle className="text-xl text-center text-gray-600">Pending transaction (last 1h)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl text-center font-bold text-black">500,000</p>
              <p className="text-gray-500 text-sm text-center">(Average)</p>
            </CardContent>
          </Card>
          <Card className="bg-white border rounded-2xl font-quantico">
            <CardHeader>
              <CardTitle className="text-lg text-center text-gray-600">Network transaction fee (24h)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl text-center font-bold text-black">412,31 JCO</p>
              <p className="text-red-400 text-sm text-center">-5.55%</p>
            </CardContent>
          </Card>
          <Card className="bg-white border rounded-2xl font-quantico">
            <CardHeader>
              <CardTitle className="text-xl text-center text-gray-600">AVG transaction fee (24h)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl text-center font-bold text-black">3,14 USD</p>
              <p className="text-red-400 text-sm text-center">-3.35%</p>
            </CardContent>
          </Card>
        </div>

        {/* Transaction table header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 text-base">
          <div className="mb-4 md:mb-0">
            <p className="text-white">More than 5,000,000 transactions found</p>
            <p className="text-gray-400 text-sm">(Showing the last 500k records)</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-md hover:bg-[#F5B069]"
              onClick={handleDownload}
            >
              <Download size={16} />
              {!isMobile && "Download Page Data"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="px-4 py-2 bg-white text-black border border-gray-300 rounded-md hover:bg-[#F5B069]"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              First
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="w-9 h-9 bg-white text-black border border-gray-300 rounded-md hover:bg-[#F5B069]"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={16} />
            </Button>
            <div className="flex items-center justify-center min-w-[120px] h-9 px-3 bg-white text-gray-900 border border-gray-300 rounded-md">
              Page {currentPage} of {totalPages}
            </div>
            <Button
              variant="outline"
              size="icon"
              className="w-9 h-9 bg-white text-black border border-gray-300 rounded-md hover:bg-[#F5B069]"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight size={16} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="px-4 py-2 bg-white text-black border border-gray-300 rounded-md hover:bg-[#F5B069]"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              Last
            </Button>
          </div>
        </div>

        {/* Transaction table */}
        <div className="overflow-x-auto">
          <Table className="w-full border rounded-2xl relative overflow-hidden hover:bg-[#F5B069] transition-colors duration-200">
            <TableHeader className="text-base">
              <TableRow className="bg-white">
                <TableHead className="w-[50px]"></TableHead>
                <TableHead className="text-black">Transaction Hash</TableHead>
                <TableHead className="text-black">Method</TableHead>
                <TableHead className="text-black">Block</TableHead>
                <TableHead className="text-black">Age</TableHead>
                <TableHead className="text-black">From</TableHead>
                <TableHead className="text-black">To</TableHead>
                <TableHead className="text-black">Amount</TableHead>
                <TableHead className="text-black">Txn Fee</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="text-sm md:text-base">
              {transactions.map((tx, index) => (
                <TableRow key={index} className="bg-white text-black">
                  <TableCell className="p-0">
                    <div className="flex items-center justify-center h-full">
                      <Eye size={16} className="text-gray-400" />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-blue-600">
                    <div className="flex items-center space-x-2">
                      <Link href={'/transaction_detail'}>
                        <span className="cursor-pointer hover:underline">{tx.hash}</span>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToClipboard(tx.hash)}
                        className="h-5 w-5 p-0"
                      >
                        <Copy size={12} />
                      </Button>
                    </div>
                  </TableCell>

                  <TableCell>
                    <button
                      onClick={() => handleMethodClick(tx.method)}
                      className={`px-3 py-1 rounded-full text-base font-medium w-24 h-8 flex items-center justify-center ${selectedMethod === tx.method
                        ? 'bg-purple-100 text-[#F5B069] border-2 border-[#F5B069]'
                        : 'bg-gray-100 text-gray-800 border border-gray-300'
                        }`}
                    >
                      {tx.method}
                    </button>
                  </TableCell>
                  <TableCell>{tx.block}</TableCell>
                  <TableCell>{tx.age}</TableCell>
                  <TableCell className="text-blue-600">
                    <div className="flex items-center space-x-2">
                      <Link href={'/wallet_address'}>
                        <span className="cursor-pointer hover:underline">{tx.from}</span>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToClipboard(tx.from)}
                        className="h-5 w-5 p-0"
                      >
                        <Copy size={12} />
                      </Button>
                    </div>
                  </TableCell>

                  <TableCell className="text-blue-600">
                    <div className="flex items-center space-x-2">
                      <Link href={'/wallet_address'}>
                        <span className="cursor-pointer hover:underline">{tx.to}</span>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToClipboard(tx.to)}
                        className="h-5 w-5 p-0"
                      >
                        <Copy size={12} />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>{formatAmount(tx.amount)}</TableCell>
                  <TableCell>{formatFee(tx.fee)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination controls (bottom) */}
        <div className="flex justify-center md:justify-between items-center mt-4 flex-wrap gap-2">
          <br></br>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="px-4 py-2 bg-white text-black border border-gray-300 rounded-md hover:bg-[#F5B069]"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              First
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="w-9 h-9 bg-white text-black border border-gray-300 rounded-md hover:bg-[#F5B069]"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={16} />
            </Button>
            <div className="flex items-center justify-center min-w-[120px] h-9 px-3 bg-white text-gray-900 border border-gray-300 rounded-md">
              Page {currentPage} of {totalPages}
            </div>
            <Button
              variant="outline"
              size="icon"
              className="w-9 h-9 bg-white text-black border border-gray-300 rounded-md hover:bg-[#F5B069]"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight size={16} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="px-4 py-2 bg-white text-black border border-gray-300 rounded-md hover:bg-[#F5B069]"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              Last
            </Button>
          </div>
        </div>

        {/* Informational text */}
        <p className="mt-4 text-sm text-gray-400">
          A transaction is a cryptographically signed instruction that changes the blockchain state. Block explorers track the details of all transactions in the network. Learn more about transactions in our Knowledge Base.
        </p>

        {/* Back to top button */}
        <Button
          id="back-to-top"
          variant="link"
          className="mt-4 text-blue-500 hover:text-[#F5B069]"
        >
          Back to Top
        </Button>
      </div>
    </div>


  )
}