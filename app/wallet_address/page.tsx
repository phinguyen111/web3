'use client'

import React, { useCallback, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { ChevronDown, ChevronLeft, ChevronRight, X } from 'lucide-react';
import {
  Background,
  Controls,
  Edge,
  NodeProps,
  EdgeProps,
  Connection,
  MarkerType,
  useNodesState,
  useEdgesState,
  Position,
  Handle,
  addEdge,
} from "reactflow";
import "reactflow/dist/style.css";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSearchParams } from 'next/navigation';
import HistoryTable from "@/components/HistoryTable";
const ReactFlow = dynamic(() => import("reactflow").then((mod) => mod.default), { ssr: false });
import Image from 'next/image';

interface ApiTransaction {
  from: string;
  to: string;
  amount: number;
  timestamp: number;
  hash?: string;
  block?: string;
  fee?: string;
}

interface TokenHolding {
  token_name: string
  token_symbol: string
  amount: string
}

interface AddressInfo {
  address: string
  gas: string
  balance: string
  totalSent: string
  totalReceived: string
  privateNameTag?: string
  firstSeen?: string
  lastSeen?: string
  fundedBy?: string
  multichainInfo?: string
  value: string
}

const CircleNode = ({ data }: NodeProps) => (
  <div className="flex items-center justify-center w-20 h-20 rounded-full bg-orange-400 text-white border-2 border-orange-500 shadow-lg">
    <Handle type="target" position={Position.Left} className="w-3 h-3 bg-blue-500" />
    <div className="text-xs font-mono">{data.label}</div>
    <Handle type="source" position={Position.Right} className="w-3 h-3 bg-blue-500" />
  </div>
);

const CircleNodePro = ({ data }: NodeProps) => (
  <div className="flex items-center justify-center w-20 h-20 rounded-full bg-orange-400 text-white border-2 border-orange-500 shadow-lg">
    <Handle type="target" position={Position.Left} className="w-3 h-3 bg-blue-500" />
    <div className="text-xs font-mono">{data.label}</div>
    <Handle type="source" position={Position.Right} className="w-3 h-3 bg-blue-500" />
  </div>
);

const CustomEdge = ({ id, sourceX, sourceY, targetX, targetY, style = {}, markerEnd, data }: EdgeProps) => {
  const edgePath = `M${sourceX},${sourceY} L${targetX},${targetY}`;
  return (
    <>
      <path id={id} style={style} className="react-flow__edge-path" d={edgePath} markerEnd={markerEnd} />
      <text>
        <textPath href={`#${id}`} style={{ fontSize: 12, fill: "white" }} startOffset="50%" textAnchor="middle">
          {data.label}
        </textPath>
      </text>
    </>
  );
};

const nodeTypes = { circle: CircleNode, star: CircleNodePro };
const edgeTypes = { custom: CustomEdge };

const processTransactions = (transactions: ApiTransaction[], centralAddress: string) => {
  const newNodes: Node[] = [];
  const newEdges: Edge[] = [];
  const addedNodes = new Set<string>();
  const edgeAmounts = new Map<string, number>();

  const radius = 500; // Adjust this value to change the size of the circle
  let angle = 0;
  const angleStep = (2 * Math.PI) / transactions.length;

  const addNode = (address: string, isCentral: boolean) => {
    if (!addedNodes.has(address)) {
      let x, y;
      if (isCentral) {
        x = 0;
        y = 0;
      } else {
        x = Math.cos(angle) * radius;
        y = Math.sin(angle) * radius;
        angle += angleStep;
      }

      newNodes.push({
        id: address,
        type: isCentral ? "star" : "circle",
        position: { x, y },
        data: { label: `${address.slice(0, 6)}...${address.slice(-4)}` }
      });
      addedNodes.add(address);
    }
  };

  // Add central node first
  addNode(centralAddress.toLowerCase(), true);

  transactions.forEach((tx: ApiTransaction) => {
    const txFrom = tx.from.toLowerCase();
    const txTo = tx.to.toLowerCase();
    const edgeId = `${txFrom}-${txTo}`;

    addNode(txFrom, txFrom === centralAddress.toLowerCase());
    addNode(txTo, txTo === centralAddress.toLowerCase());

    edgeAmounts.set(edgeId, (edgeAmounts.get(edgeId) || 0) + tx.amount);
  });

  edgeAmounts.forEach((amount, edgeId) => {
    const [source, target] = edgeId.split('-');
    newEdges.push({
      id: `e${edgeId}`,
      source,
      target,
      type: "custom",
      data: { label: `${amount.toFixed(4)} ETH` },
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: "#60a5fa", strokeWidth: 3 }
    });
  });

  return { nodes: newNodes, edges: newEdges };
};

const forceSimulation = (nodes: Node[], edges: Edge[]) => {
  const REPULSION = 20000;  // Increased repulsion for greater spread
  const ATTRACTION = 0.05;  // Attraction remains low to prevent nodes from pulling together
  const ITERATIONS = 200;   // Increase iterations if needed for finer control
  const MAX_VELOCITY = 10;

  for (let iteration = 0; iteration < ITERATIONS; iteration++) {
    // Calculate repulsive forces
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[j].position.x - nodes[i].position.x;
        const dy = nodes[j].position.y - nodes[i].position.y;
        const distanceSq = dx * dx + dy * dy;
        if (distanceSq === 0) continue;

        // Adjusted repulsion calculation (reduce strength of force for close nodes)
        const force = REPULSION / Math.sqrt(distanceSq);
        const forceX = force * dx / distanceSq;
        const forceY = force * dy / distanceSq;

        nodes[i].position.x -= forceX;
        nodes[i].position.y -= forceY;
        nodes[j].position.x += forceX;
        nodes[j].position.y += forceY;
      }
    }

    // Calculate attractive forces
    edges.forEach(edge => {
      const source = nodes.find(n => n.id === edge.source);
      const target = nodes.find(n => n.id === edge.target);
      if (source && target) {
        const dx = target.position.x - source.position.x;
        const dy = target.position.y - source.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Attraction with logarithmic decay (could experiment with different formulas)
        const force = ATTRACTION * Math.log(distance + 1);
        const forceX = force * dx / distance;
        const forceY = force * dy / distance;

        source.position.x += forceX;
        source.position.y += forceY;
        target.position.x -= forceX;
        target.position.y -= forceY;
      }
    });

    // Limit maximum velocity
    nodes.forEach(node => {
      const velocity = Math.sqrt(node.position.x * node.position.x + node.position.y * node.position.y);
      if (velocity > MAX_VELOCITY) {
        const scale = MAX_VELOCITY / velocity;
        node.position.x *= scale;
        node.position.y *= scale;
      }
    });
  }

  return { nodes, edges };
};

export default function TransactionExplorer() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [apiTransactions, setApiTransactions] = useState<ApiTransaction[]>([]);
  const [addressInfo, setAddressInfo] = useState<AddressInfo>({
    address: "",
    gas: "",
    balance: "",
    totalSent: "",
    totalReceived: "",
    value: "",
  })
  const [tokenHoldings, setTokenHoldings] = useState<TokenHolding[]>([])
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentAddress, setCurrentAddress] = useState<string>("");
  const [searchedAddress, setSearchedAddress] = useState<string>("");
  const [activeView, setActiveView] = useState<"transaction" | "graph">("graph");
  const [showRightPanel, setShowRightPanel] = useState(activeView === "graph");
  const [selectedEdge, setSelectedEdge] = useState<ApiTransaction[] | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;
  const [totalPages, setTotalPages] = useState(1);
  const searchParams = useSearchParams();
  const [isTokenHoldingsExpanded, setIsTokenHoldingsExpanded] = useState(false)

  const [filterType, setFilterType] = useState("all");
  const [addressType, setAddressType] = useState("all");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchAddress, setSearchAddress] = useState("");
  const [analysisResults, setAnalysisResults] = useState<{ address: string; txCount: number; totalEth: number }[]>([]);

  const fetchAddressInfo = useCallback(async (address: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/address/${address}`);
      const data = await response.json();

      if (data.success) {
        setAddressInfo(data.data);
        setTokenHoldings(data.data.tokenHoldings);
      } else {
        setError("Failed to fetch address information");
      }
    } catch (err) {
      console.error('Error fetching address info:', err);
      setError("An error occurred while fetching address information");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchTransactionData = useCallback(async (address: string, updateSearched: boolean = false) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/transactions?address=${address}`);
      const data = await response.json();

      if (data.success) {
        setApiTransactions(data.transactions);
        setCurrentAddress(address.toLowerCase());
        if (updateSearched) {
          setSearchedAddress(address.toLowerCase());
        }

        const { nodes, edges } = processTransactions(data.transactions, address);
        const simulatedLayout = forceSimulation(nodes, edges);
        setNodes(simulatedLayout.nodes);
        setEdges(simulatedLayout.edges);

        const ITEMS_PER_PAGE = 10;
        setTotalPages(Math.ceil(data.transactions.length / ITEMS_PER_PAGE));
      } else {
        setError("Failed to fetch transaction data");
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError("An error occurred while fetching data");
    } finally {
      setIsLoading(false);
    }
  }, [setEdges, setNodes]);

  useEffect(() => {
    const newAddress = searchParams.get('address');
    if (newAddress) {
      fetchAddressInfo(newAddress);
      fetchTransactionData(newAddress);
    }
  }, [searchParams, fetchAddressInfo, fetchTransactionData]);

  const onNodeDoubleClick = useCallback((event: React.MouseEvent, node: Node) => {
    fetchTransactionData(node.id, false);
  }, [fetchTransactionData]);

  const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    const relatedTransactions = apiTransactions.filter(
      (tx) => (tx.from === edge.source && tx.to === edge.target) || (tx.from === edge.target && tx.to === edge.source)
    );

    if (relatedTransactions.length > 0) {
      setSelectedEdge(relatedTransactions);
    }
  }, [apiTransactions]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const handleViewChange = (view: "transaction" | "graph") => {
    setActiveView(view);
    setShowRightPanel(view === "graph");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      console.log("Copied to clipboard");
    }).catch((err) => {
      console.error('Failed to copy: ', err);
    });
  };

  const handleExport = () => {
    if (selectedEdge && selectedEdge.length > 0) {
      const headers = ['Time (UTC)', 'Hash', 'From', 'To', 'Amount', 'Fee'];

      const rows = selectedEdge.map((transaction) => [
        transaction.timestamp ? new Date(transaction.timestamp * 1000).toLocaleString() : 'N/A',
        transaction.hash ? transaction.hash : 'No data',
        transaction.from ? transaction.from : 'No data',
        transaction.to ? transaction.to : 'No data',
        transaction.amount ? transaction.amount : 'N/A',
        transaction.fee ? transaction.fee : 'N/A',
      ]);

      const csvContent = [headers, ...rows]
        .map((row) => row.join(','))
        .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `transaction_history.csv`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      alert('No data to download.');
    }
  };

  const applyFilters = useCallback(() => {
    let filteredTransactions = apiTransactions;

    if (filterType !== "all") {
      filteredTransactions = filteredTransactions.filter(tx =>
        filterType === "in" ? tx.to === currentAddress : tx.from === currentAddress
      );
    }

    if (addressType !== "all") {
      // Implement logic for known/unknown addresses if needed
    }

    if (minAmount) {
      filteredTransactions = filteredTransactions.filter(tx => tx.amount >= parseFloat(minAmount));
    }
    if (maxAmount) {
      filteredTransactions = filteredTransactions.filter(tx => tx.amount <= parseFloat(maxAmount));
    }

    if (startDate) {
      const startTimestamp = new Date(startDate).getTime() / 1000;
      filteredTransactions = filteredTransactions.filter(tx => tx.timestamp >= startTimestamp);
    }
    if (endDate) {
      const endTimestamp = new Date(endDate).getTime() / 1000;
      filteredTransactions = filteredTransactions.filter(tx => tx.timestamp <= endTimestamp);
    }

    const { nodes, edges } = processTransactions(filteredTransactions, currentAddress);
    const simulatedLayout = forceSimulation(nodes, edges);
    setNodes(simulatedLayout.nodes);
    setEdges(simulatedLayout.edges);
  }, [apiTransactions, filterType, addressType, minAmount, maxAmount, startDate, endDate, currentAddress, setNodes, setEdges]);

  const updateAnalysis = useCallback(() => {
    const analysis = apiTransactions.reduce((acc, tx) => {
      const address = tx.from === currentAddress ? tx.to : tx.from;
      if (!acc[address]) {
        acc[address] = { txCount: 0, totalEth: 0 };
      }
      acc[address].txCount += 1;
      acc[address].totalEth += tx.amount;
      return acc;
    }, {} as Record<string, { txCount: number; totalEth: number }>);

    const analysisArray = Object.entries(analysis)
      .map(([address, data]) => ({ address, ...data }))
      .filter(item => item.address.toLowerCase().includes(searchAddress.toLowerCase()))
      .sort((a, b) => b.totalEth - a.totalEth)
      .slice(0, 10);  // Top 10 addresses

    setAnalysisResults(analysisArray);
  }, [apiTransactions, currentAddress, searchAddress]);

  useEffect(() => {
    applyFilters();
    updateAnalysis();
  }, [applyFilters, updateAnalysis]);

  // Calculate transactions to display
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTransactions = selectedEdge ? selectedEdge.slice(startIndex, endIndex) : [];

  return (
    <>
      {/* Header section with wallet address information */}
      <div className="bg-primaryGray p-4 sm:p-6 text-white sm:px-8 lg:px-20 font-exo2">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
          <h1 className="text-xl sm:text-2xl font-semibold font-quantico">Address Information</h1>
          <div className="flex items-center font-exo2">
            <p className="text-xs sm:text-sm font-light mr-4">
              Gas: <span className="font-bold">{addressInfo.gas} Gwei</span>
            </p>
          </div>
        </div>

        {/* Wallet overview section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center mt-4 space-y-4 sm:space-y-0">
          <Image
            src="https://static.vecteezy.com/system/resources/previews/030/750/807/original/user-icon-in-trendy-outline-style-isolated-on-white-background-user-silhouette-symbol-for-your-website-design-logo-app-ui-illustration-eps10-free-vector.jpg"
            alt="User"
            width={40}
            height={40}
            className="rounded-full mr-4"
          />
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 flex-grow font-exo2">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
              <p className="text-lg sm:text-xl font-semibold">Address</p>
              <p className="text-xs break-all">{addressInfo.address}</p>
            </div>
            <div className="flex space-x-2">
              {['copy', 'qrcode', 'comment'].map((icon, index) => (
                <button
                  key={index}
                  className="text-white p-1 rounded-lg transition duration-200 ease-in-out hover:bg-gray-700"
                  onClick={icon === 'copy' ? () => copyToClipboard(addressInfo.address) : undefined}
                >
                </button>
              ))}
            </div>
          </div>
          {/* Main content area with transaction graph and table */}
        </div>
        {/* Main content area */}
        <div className="flex flex-wrap items-center mt-4 space-x-2 space-y-2">
          {['<public name tag>', '<public name tag> <coin name>', '# <public name tag>'].map((text, index) => (
            <button
              key={index}
              className="bg-[#7F7C79] text-white font-bold py-1 px-2 text-[10px] rounded-lg shadow-sm transition duration-200 ease-in-out hover:bg-[#666] hover:text-[#fff] flex items-center"
            >
            </button>
          ))}
        </div>
      </div>
      <div className={` bg-[#1C2128] text-white font-exo2`}>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ">
            <div className="bg-white text-gray-900 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Overview</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600 font-bold">Balance:</p>
                  <p>{addressInfo.balance} ETH</p>
                </div>
                <div>
                  <p className="text-gray-600 font-bold">Total Sent:</p>
                  <p>{addressInfo.totalSent} ETH</p>
                </div>
                <div>
                  <p className="text-gray-600 font-bold">Value:</p>
                  <p>{addressInfo.totalReceived} ETH</p>
                </div>
                <div>
                  <p className="text-gray-600 font-bold">Total Received:</p>
                  <p>${addressInfo.value} USD</p>
                </div>
              </div>
              <div>
                <p className="text-muted-foreground mb-2 font-semibold">TOKEN HOLDINGS:</p>
                <Button
                  variant="outline"
                  onClick={() => setIsTokenHoldingsExpanded(!isTokenHoldingsExpanded)}
                  className="w-full justify-between"
                >
                  <span>
                    {tokenHoldings.length
                      ? `$${tokenHoldings.length * 1000} ( ${tokenHoldings.length} tokens )`
                      : "No tokens found"}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-200 ${isTokenHoldingsExpanded ? "rotate-180" : ""
                      }`}
                  />
                </Button>

                {isTokenHoldingsExpanded && (
                  <div className="mt-2 p-2 bg-muted rounded-md">
                    {tokenHoldings.length ? (
                      <ul className="space-y-2">
                        {tokenHoldings.map((token, index) => (
                          <li key={index}>
                            <p className="font-semibold">
                              {token.token_name} ({token.token_symbol})
                            </p>
                            <p>{token.amount}</p>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>No token holdings available.</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white text-gray-900 rounded-lg p-6">
              <h3 className="text-xl mb-4 font-bold">
                More information
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-bold">
                    Private name tag:
                  </span>
                  <span className="bg-[#F5B056] text-gray-800 px-3 py-1 rounded-md">
                    {addressInfo.privateNameTag || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-bold">First seen:</span>
                  <span>{addressInfo.firstSeen || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-bold">Last seen:</span>
                  <span>{addressInfo.lastSeen || "N/A"}</span>
                </div>
                <div>
                  <p className="text-gray-600 mb-1 font-bold">Funded by:</p>
                  <a href="#" className="text-blue-500 hover:underline">
                    {addressInfo.fundedBy || "N/A"}
                  </a>
                </div>
                <div>
                  <p className="text-gray-600 mb-1 font-bold">
                    Multichain info:
                  </p>
                  <span className="bg-[#F5B056] text-gray-800 px-3 py-1 rounded-md inline-block">
                    {addressInfo.multichainInfo || "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Transaction graph and history buttons */}
      <div className="flex justify-between items-center w-full bg-[#1a2b4b] p-4 border-b border-blue-700">
        <div className="flex space-x-2">
          <Button
            onClick={() => handleViewChange("transaction")}
            className={`font-bold py-2 px-4 rounded-t-lg transition duration-200 ease-in-out ${activeView === "transaction"
              ? "bg-white text-[#1a2b4b]"
              : "bg-transparent text-white hover:bg-blue-600"
              }`}
          >
            Transaction history
          </Button>
          <Button
            onClick={() => handleViewChange("graph")}
            className={`font-bold py-2 px-4 rounded-t-lg transition duration-200 ease-in-out ${activeView === "graph"
              ? "bg-white text-[#1a2b4b]"
              : "bg-transparent text-white hover:bg-blue-600"
              }`}
          >
            Transaction Graph
          </Button>
        </div>
      </div>

      {/* Main content area with transaction graph and table */}
      <div className="w-full h-full flex flex-col relative z-10 font-exo2 mb-8">
        {isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}

        <div className="flex bg-[#1C2128] px-2 py-4 border-b border-b-white">
          {/* Add header content if needed */}
        </div>
        <div className="flex-grow flex">
          {activeView === "transaction" ? (
            <HistoryTable />
          ) : (
            <div className="flex-grow flex">
              {activeView === "graph" && (
                <div className="w-full h-[600px] border border-gray-300">
                  <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onNodeDoubleClick={onNodeDoubleClick}
                    onEdgeClick={onEdgeClick}
                    nodeTypes={nodeTypes}
                    edgeTypes={edgeTypes}
                    fitView
                    minZoom={0.1}
                    maxZoom={1.5}
                  >
                    <Controls />
                    <Background />
                  </ReactFlow>
                </div>
              )}
              {showRightPanel && (
                <div className="w-full lg:w-full xl:w-1/3 h-full overflow-hidden">
                  <div className="h-full overflow-y-auto p-2 sm:p-4 space-y-4 bg-gray-800 bg-opacity-90">
                    <Card className="bg-gray-800 border-gray-700">
                      <CardHeader>
                        <CardTitle className="text-white">Filter</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <Select value={filterType} onValueChange={setFilterType}>
                            <SelectTrigger className="bg-gray-700 text-white border-gray-600">
                              <SelectValue placeholder="All txs" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-700 text-white border-gray-600">
                              <SelectItem value="all">All txs</SelectItem>
                              <SelectItem value="in">Incoming</SelectItem>
                              <SelectItem value="out">Outgoing</SelectItem>
                            </SelectContent>
                          </Select>
                          <Select value={addressType} onValueChange={setAddressType}>
                            <SelectTrigger className="bg-gray-700 text-white border-gray-600">
                              <SelectValue placeholder="All addresses" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-700 text-white border-gray-600">
                              <SelectItem value="all">All addresses</SelectItem>
                              <SelectItem value="known">Known addresses</SelectItem>
                              <SelectItem value="unknown">Unknown addresses</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <Input
                            placeholder="Minimum"
                            value={minAmount}
                            onChange={(e) => setMinAmount(e.target.value)}
                            className="bg-gray-700 text-white border-gray-600"
                          />
                          <Input
                            placeholder="Maximum"
                            value={maxAmount}
                            onChange={(e) => setMaxAmount(e.target.value)}
                            className="bg-gray-700 text-white border-gray-600"
                          />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <Input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="bg-gray-700 text-white border-gray-600"
                          />
                          <Input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="bg-gray-700 text-white border-gray-600"
                          />
                        </div>
                        <Button onClick={applyFilters} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                          Apply Filters
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="bg-gray-800 border-gray-700">
                      <CardHeader>
                        <CardTitle className="text-white">Analysis</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="mb-4">
                          <Input
                            placeholder="Search by address/label"
                            value={searchAddress}
                            onChange={(e) => setSearchAddress(e.target.value)}
                            className="bg-gray-700 text-white border-gray-600"
                          />
                        </div>
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow className="border-gray-700">
                                <TableHead className="text-gray-400">Sender</TableHead>
                                <TableHead className="text-gray-400">Txn</TableHead>
                                <TableHead className="text-gray-400">Eth</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {analysisResults.map((item, i) => (
                                <TableRow key={i} className="border-gray-700">
                                  <TableCell className="text-gray-300">{item.address}</TableCell>
                                  <TableCell className="text-gray-300">{item.txCount}</TableCell>
                                  <TableCell className="text-gray-300">{item.totalEth.toFixed(4)}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {selectedEdge && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
            <div className="bg-[#1a2b4b] px-4 sm:px-6 pb-6 rounded-lg w-full max-w-4xl mx-auto overflow-hidden">
              <div className="flex justify-between items-center mt-6 mb-4">
                <h2 className="text-white text-xl sm:text-2xl font-semibold">
                  Transaction details
                </h2>
                <button
                  onClick={() => setSelectedEdge(null)}
                  className="text-white hover:text-gray-300"
                  aria-label="Close"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="bg-white rounded-lg overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="p-3 w-1/2 text-gray-950 text-left whitespace-nowrap">Time (UTC)</th>
                      <th className="p-3 text-gray-950 text-left whitespace-nowrap">Hash</th>
                      <th className="p-3 text-gray-950 text-left whitespace-nowrap">From</th>
                      <th className="p-3 text-gray-950 text-left whitespace-nowrap">To</th>
                      <th className="p-3 text-gray-950 text-left whitespace-nowrap">Amount</th>
                      <th className="p-3 text-gray-950 text-left whitespace-nowrap">Fee</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentTransactions.map((transaction, index) => (
                      <tr key={index} className="border-b last:border-b-0">
                        <td className="px-3 sm:px-4 py-4 flex items-center">
                          <div className="text-gray-950 w-1/2 text-sm sm:text-base">
                            {new Date(transaction.timestamp * 1000).toLocaleString()}
                          </div>
                        </td>
                        <td className="text-gray-950 px-3 py-4 text-sm sm:text-base">
                          {transaction && transaction.hash ? (
                            <>
                              {transaction.hash.slice(0, 12)}...{transaction.hash.slice(-8)}
                            </>
                          ) : (
                            "No data"
                          )}
                        </td>
                        <td className="text-gray-950 px-3 py-4 text-sm sm:text-base">
                          {transaction && transaction.from ? (
                            <>
                              {transaction.from.slice(0, 6)}...{transaction.from.slice(-4)}
                            </>
                          ) : (
                            "No data"
                          )}
                        </td>
                        <td className="text-gray-950 px-3 py-4 text-sm sm:text-base">
                          {transaction && transaction.to ? (
                            <>
                              {transaction.to.slice(0, 6)}...{transaction.to.slice(-4)}
                            </>
                          ) : (
                            "No data"
                          )}
                        </td>
                        <td className="text-gray-950 px-3 py-4 text-sm sm:text-base">{transaction.amount}</td>
                        <td className="text-gray-950 px-3 py-4 text-sm sm:text-base">{transaction.fee || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-center mt-4 space-y-4 sm:space-y-0">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    className="bg-[#2a3b5b] text-gray-300 p-2 rounded hover:bg-[#3a4b6b]"
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-white">{currentPage} / {totalPages}</span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    className="bg-[#2a3b5b] text-gray-300 p-2 rounded hover:bg-[#3a4b6b]"
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
                <button
                  onClick={handleExport}
                  className="bg-transparent border border-red-500 text-red-500 px-4 py-2 rounded flex items-center hover:bg-red-500 hover:text-white transition-colors"
                >
                  Export
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
