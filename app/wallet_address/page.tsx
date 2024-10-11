"use client";

import React, { useCallback, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Facebook, Twitter, Instagram, Send, MessageCircle, Youtube } from 'lucide-react'

import {
  faUser,
  faCopy as faCopySolid,
  faQrcode as faQrcodeSolid,
  faComment as faCommentSolid,
} from "@fortawesome/free-solid-svg-icons";
import { ChevronDown, Search, Clipboard, ExternalLink, X, Copy, Eye, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { Poppins } from "next/font/google";
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});
import Link from "next/link";
import Image from "next/image";
import {
  Background,
  Controls,
  Node,
  Edge,
  NodeProps,
  EdgeProps,
  NodeChange,
  EdgeChange,
  OnNodesChange,
  OnEdgesChange,
  Handle,
  Position,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  MarkerType,
  Connection,
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
/*import { Separator } from "@/components/ui/separator";*/
import { MouseEvent } from 'react';

// Dynamically import ReactFlow to avoid SSR issues
const ReactFlow = dynamic(
  () => import("reactflow").then((mod) => mod.default),
  {
    ssr: false,
  }
);

// Mock function to generate connected nodes
const generateConnectedNodes = (nodeId: string, clickedNodePosition: { x: number, y: number }) => {
  const connectedNodes = [];
  const connectedEdges = [];

  // Generate node on the left (A)
  const leftNodeId = `${nodeId}-left`;
  connectedNodes.push({
    id: leftNodeId,
    type: "circle",
    position: {
      x: clickedNodePosition.x - 150,
      y: clickedNodePosition.y - 150,
    },
    data: { label: `0x${leftNodeId.slice(0, 4)}...${leftNodeId.slice(-4)}` },
  });

  // Generate node on the right (C)
  const rightNodeId = `${nodeId}-right`;
  connectedNodes.push({
    id: rightNodeId,
    type: "circle",
    position: {
      x: clickedNodePosition.x + 150,
      y: clickedNodePosition.y - 100,
    },
    data: { label: `0x${rightNodeId.slice(0, 4)}...${rightNodeId.slice(-4)}` },
  });

  // Create edges: A -> B -> C
  connectedEdges.push({
    id: `e-${leftNodeId}-${nodeId}`,
    source: leftNodeId,
    target: nodeId,
    type: "custom",
    data: { label: `${(Math.random() * 5).toFixed(2)} ETH` },
    markerEnd: { type: MarkerType.ArrowClosed },
    style: { stroke: "#60a5fa", strokeWidth: 3 },
  });

  connectedEdges.push({
    id: `e-${nodeId}-${rightNodeId}`,
    source: nodeId,
    target: rightNodeId,
    type: "custom",
    data: { label: `${(Math.random() * 5).toFixed(2)} ETH` },
    markerEnd: { type: MarkerType.ArrowClosed },
    style: { stroke: "#60a5fa", strokeWidth: 3 },
  });

  return { nodes: connectedNodes, edges: connectedEdges };
};

// Custom node components for the graph
const CircleNode = ({ data }: NodeProps) => (
  <div className="flex items-center justify-center w-20 h-20 rounded-full bg-orange-400 text-white border-2 border-orange-500 shadow-lg">
    <Handle
      type="target"
      position={Position.Left}
      className="w-3 h-3 bg-blue-500"
    />
    <div className="text-xs font-mono">{data.label}</div>
    <Handle
      type="source"
      position={Position.Right}
      className="w-3 h-3 bg-blue-500"
    />
  </div>
);

const StarNode = ({ data }: NodeProps) => (
  <div
    className="flex items-center justify-center w-28 h-28 cursor-pointer"
    onClick={() => data.onClick(data.id)}
  >
    <Handle
      type="target"
      position={Position.Left}
      className="w-3 h-3 bg-blue-500"
    />
    <svg
      viewBox="0 0 24 24"
      className="w-full h-full fill-yellow-400 stroke-yellow-600"
    >
      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
    </svg>
    <Handle
      type="source"
      position={Position.Right}
      className="w-3 h-3 bg-blue-500"
    />
  </div>
);

// Custom edge component for the graph
const CustomEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  style = {},
  markerEnd,
  data,
}: EdgeProps) => {
  const edgePath = `M${sourceX},${sourceY} L${targetX},${targetY}`;
  const handleClick = () => {
    if (data && data.onClick) {
      data.onClick(id);
    }
  };
  return (
    <>
      <path
        id={id}
        style={style}
        className="react-flow__edge-path cursor-pointer"
        d={edgePath}
        markerEnd={markerEnd}
        onClick={handleClick}
      />
      <text>
        <textPath
          href={`#${id}`}
          style={{ fontSize: 12, fill: "white" }}
          startOffset="50%"
          textAnchor="middle"
        >
          {data.label}
        </textPath>
      </text>
    </>
  );
};

// Define node and edge types for the graph
const nodeTypes = {
  circle: CircleNode,
  star: StarNode,
};

const edgeTypes = {
  custom: CustomEdge,
};

// Interface for transaction data
interface Transaction {
  time: string;
  sender: string;
  recipient: string;
  amount: string;
  txid: string;
}
// Mock transaction data
const transactionsG: Transaction[] = [
  {
    time: "Aug 18, 03:49 AM",
    sender: "0xe6b1de...f92033a3",
    recipient: "0xe6b1de...f92033a3",
    amount: "0.23 ETH",
    txid: "0xe6b1de...f92033a3",
  },
  {
    time: "Aug 18, 03:49 AM",
    sender: "0xe6b1de...f92033a3",
    recipient: "0xe6b1de...f92033a3",
    amount: "0.23 ETH",
    txid: "0xe6b1de...f92033a3",
  },
  {
    time: "Aug 18, 03:49 AM",
    sender: "0xe6b1de...f92033a3",
    recipient: "0xe6b1de...f92033a3",
    amount: "0.23 ETH",
    txid: "0xe6b1de...f92033a3",
  },
];

const transactions = [
  {
    hash: "0x02bJ97ca75...",
    method: "Transfer",
    block: "050505",
    age: "5 secs ago",
    from: "0x0496A6IA...J97500BC",
    to: "0x0496A6IA...J97500BC",
    amount: "5,000,000 JCO",
    fee: "0.050505",
  },
  {
    hash: "0xeb2ebalac2...",
    method: "Transfer",
    block: "050505",
    age: "5 secs ago",
    from: "0xA7B72C9J7...8E54d0d",
    to: "0xA7B72C9J7...8E54d0d",
    amount: "150 JCO",
    fee: "0.001102",
  },
  {
    hash: "0xJ978BocOn5t...",
    method: "Claim",
    block: "050505",
    age: "5 secs ago",
    from: "0xJaK5tRiEuY...43J09d9k",
    to: "0xJaK5tRiEuY...43J09d9k",
    amount: "5050 JCO",
    fee: "0.0501102",
  },
  {
    hash: "0xB8eS0lc0nJ97...",
    method: "Execute",
    block: "050505",
    age: "5 secs ago",
    from: "0xA7Rl2C9J7...RlRk7d0d",
    to: "0xA7Rl2C9J7...RlRk7d0d",
    amount: "5,000 JCO",
    fee: "0.500000",
  },
  {
    hash: "0x89025532c...",
    method: "Transfer",
    block: "050505",
    age: "5 secs ago",
    from: "0xJaK5tRiEuY...43J09d9k",
    to: "0xJaK5tRiEuY...43J09d9k",
    amount: "5050 JCO",
    fee: "0.500000",
  },
];

export default function TransactionExplorer() {
  // State variables
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null)
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false)
  const [activeView, setActiveView] = useState<"transaction" | "graph">("graph");
  const totalPages = 3;
  const [isTokenHoldingsExpanded, setIsTokenHoldingsExpanded] = useState(false);
  const [showRightPanel, setShowRightPanel] = useState(activeView === "graph");
  const [expandedNodes, setExpandedNodes] = useState<string[]>([]);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedEdge, setSelectedEdge] = useState<Transaction | null>(null);

  // Function to handle element click in the graph
  const handleElementClick = (id: string) => {
    setSelectedElement(id);
    setIsOpen(true);
  };
  useEffect(() => {
    const initialNodes = [
      {
        id: "1",
        type: "circle",
        position: { x: 0, y: 0 },
        data: { label: "0x9d...e78", onClick: handleElementClick },
      },
      {
        id: "2",
        type: "circle",
        position: { x: 0, y: 100 },
        data: { label: "0x9d...e79", onClick: handleElementClick },
      },
      {
        id: "3",
        type: "circle",
        position: { x: 0, y: 200 },
        data: { label: "0x9d...e80", onClick: handleElementClick },
      },
      {
        id: "11",
        type: "circle",
        position: { x: 0, y: 300 },
        data: { label: "0x9d...e80", onClick: handleElementClick },
      },
      {
        id: "12",
        type: "circle",
        position: { x: 0, y: -100 },
        data: { label: "0x9d...e80", onClick: handleElementClick },
      },
      {
        id: "star",
        type: "star",
        position: { x: 200, y: 100 },
        data: { label: "Contract", onClick: handleElementClick },
      },
      {
        id: "4",
        type: "circle",
        position: { x: 400, y: 0 },
        data: { label: "0x9d...e81", onClick: handleElementClick },
      },
      {
        id: "5",
        type: "circle",
        position: { x: 400, y: 100 },
        data: { label: "0x9d...e82", onClick: handleElementClick },
      },
      {
        id: "6",
        type: "circle",
        position: { x: 400, y: 200 },
        data: { label: "0x9d...e83", onClick: handleElementClick },
      },
    ];

    const initialEdges = [
      {
        id: "e1-star",
        source: "1",
        target: "star",
        type: "custom",
        data: { label: "3.923 ETH", onClick: handleElementClick },
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { stroke: "#60a5fa", strokeWidth: 3 },
      },
      {
        id: "e13-star",
        source: "13",
        target: "star",
        type: "custom",
        data: { label: "3.923 ETH", onClick: handleElementClick },
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { stroke: "#60a5fa", strokeWidth: 3 },
      },
      {
        id: "e12-star",
        source: "12",
        target: "star",
        type: "custom",
        data: { label: "3.923 ETH" },
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { stroke: "#60a5fa", strokeWidth: 3 },
      },
      {
        id: "e11-star",
        source: "11",
        target: "star",
        type: "custom",
        data: { label: "3.923 ETH", onClick: handleElementClick },
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { stroke: "#60a5fa", strokeWidth: 3 },
      },
      {
        id: "e2-star",
        source: "2",
        target: "star",
        type: "custom",
        data: { label: "2.5 ETH", onClick: handleElementClick },
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { stroke: "#60a5fa", strokeWidth: 3 },
      },
      {
        id: "e3-star",
        source: "3",
        target: "star",
        type: "custom",
        data: { label: "1.7 ETH", onClick: handleElementClick },
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { stroke: "#60a5fa", strokeWidth: 3 },
      },
      {
        id: "estar-4",
        source: "star",
        target: "4",
        type: "custom",
        data: { label: "2.1 ETH", onClick: handleElementClick },
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { stroke: "#60a5fa", strokeWidth: 3 },
      },
      {
        id: "estar-5",
        source: "star",
        target: "5",
        type: "custom",
        data: { label: "3.0 ETH", onClick: handleElementClick },
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { stroke: "#60a5fa", strokeWidth: 3 },
      },
      {
        id: "estar-6",
        source: "star",
        target: "6",
        type: "custom",
        data: { label: "3.023 ETH", onClick: handleElementClick },
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { stroke: "#60a5fa", strokeWidth: 3 },
      },
    ];

    setNodes(initialNodes);
    setEdges(initialEdges);
  }, []);

  // Function to handle node click in the graph
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    const collapseConnectedNodes = (nodeId: string) => {
      // Delete all nodes and edges related to the currently clicked node
      setNodes((nds) => nds.filter((n) => !n.id.startsWith(`${nodeId}-`)));
      setEdges((eds) => eds.filter((e) =>
        !e.source.startsWith(`${nodeId}-`) &&
        !e.target.startsWith(`${nodeId}-`)
      ));
    };

    if (expandedNodes.includes(node.id)) {
      // 
      collapseConnectedNodes(node.id);
      setExpandedNodes(expandedNodes.filter((id) => id !== node.id));
    } else {
      // When clicking back on an opened node, closes the branches of that node.
      const { nodes: newNodes, edges: newEdges } = generateConnectedNodes(node.id, node.position);
      setNodes((nds) => [...nds, ...newNodes]); // Adding new node
      setEdges((eds) => [...eds, ...newEdges]); // Adding new edges
      setExpandedNodes([...expandedNodes, node.id]); // Save opened node
    }
  }, [expandedNodes]);



  // Functions to handle changes in nodes and edges
  const onNodesChange: OnNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );

  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );

  // Function to toggle right panel
  const toggleRightPanel = () => {
    setIsRightPanelOpen(!isRightPanelOpen);
  };

  // Function to handle export (placeholder)
  const handleExport = () => {
    console.log("Exporting transactions...");
  };

  // Function to handle view change between transaction and graph
  const handleViewChange = (view: "transaction" | "graph") => {
    setActiveView(view);
    setShowRightPanel(view === "graph");
    if (view === "transaction") {
      setShowRightPanel(false)
    } else {
      setShowRightPanel(true)
    }
  };

  // Function to copy text to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      console.log("Copied to clipboard");
    }).catch((err) => {
      console.error('Failed to copy: ', err);
    });
  };

  // Function to handle method click in transaction table
  const handleMethodClick = (method: string) => {
    setSelectedMethod(method === selectedMethod ? null : method)
  };

  // Functions to format amount and fee
  const formatAmount = (amount: string) => {
    const [value, currency] = amount.split(' ')
    const formattedValue = Number(value.replace(/,/g, '')).toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
    return `${formattedValue} ${currency}`
  };

  const formatFee = (fee: string) => {
    return Number(parseFloat(fee).toFixed(6)).toString()
  };

  // Effect to handle responsive design
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, []);

  // Function to handle data download
  const handleDownload = () => {
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
          formatAmount(tx.amount).replace(/,/g, ''),
          formatFee(tx.fee)
        ].join(',')
      )
    ].join('\n')

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
  };

  // Function to handle edge click in the graph
  const onEdgeClick = useCallback((event: MouseEvent, edge: any) => {
    console.log("Edge clicked:", edge);
    setSelectedEdge(edge);
    setIsOpen(true);
  }, []);


  return (
    <>
      {/* Header section with wallet address information */}
      <div className="bg-primaryGray p-4 sm:p-6 text-white sm:px-8 lg:px-20 font-exo2">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
          <h1 className="text-xl sm:text-2xl font-semibold font-quantico">Address Information</h1>
          <div className="flex items-center font-exo2">
            <p className="text-xs sm:text-sm font-light mr-4">
              Gas: <span className="font-bold">9.582 Gwei</span>
            </p>
          </div>
        </div>

        {/* Wallet overview section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center mt-4 space-y-4 sm:space-y-0">
          <img
            src="https://static.vecteezy.com/system/resources/previews/030/750/807/original/user-icon-in-trendy-outline-style-isolated-on-white-background-user-silhouette-symbol-for-your-website-design-logo-app-ui-illustration-eps10-free-vector.jpg"
            alt="User"
            className="rounded-full h-10 w-10 mr-4"
          />
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 flex-grow font-exo2">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
              <p className="text-lg sm:text-xl font-semibold">Address</p>
              <p className="text-xs break-all">0x68ae22fdxx5bxx050627456902182900xxa</p>
            </div>
            <div className="flex space-x-2">
              {['copy', 'qrcode', 'comment'].map((icon, index) => (
                <button
                  key={index}
                  className="text-white p-1 rounded-lg transition duration-200 ease-in-out hover:bg-gray-700"
                >
                  <FontAwesomeIcon
                    icon={icon === 'copy' ? faCopySolid : icon === 'qrcode' ? faQrcodeSolid : faCommentSolid}
                    className="h-4 w-4"
                  />
                </button>
              ))}
            </div>
          </div>
          {/* Main content area with transaction graph and table */}
          <div className="flex space-x-2 w-full sm:w-auto">
            {['Buy', 'Exchange'].map((text, index) => (
              <button
                key={index}
                className="bg-[#F16821] hover:bg-orange-700 text-white font-bold py-2 px-4 sm:px-8 text-xs rounded-xl shadow-sm transition duration-200 ease-in-out flex-1 sm:flex-none"
              >
                {text}
              </button>
            ))}
          </div>
        </div>
        {/* Main content area */}
        <div className="flex flex-wrap items-center mt-4 space-x-2 space-y-2">
          {['<public name tag>', '<public name tag> <coin name>', '# <public name tag>'].map((text, index) => (
            <button
              key={index}
              className="bg-[#7F7C79] text-white font-bold py-1 px-2 text-[10px] rounded-lg shadow-sm transition duration-200 ease-in-out hover:bg-[#666] hover:text-[#fff] flex items-center"
            >
              {index === 1 && <FontAwesomeIcon icon={faUser} className="h-3 w-3 mr-1" />}
              {text}
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
                  <p>2840 &lt;coin's name&gt;</p>
                </div>
                <div>
                  <p className="text-gray-600 font-bold">Total Sent:</p>
                  <p>2840 &lt;coin's name&gt;</p>
                </div>
                <div>
                  <p className="text-gray-600 font-bold">Value:</p>
                  <p>$22,3759 USD</p>
                </div>
                <div>
                  <p className="text-gray-600 font-bold">Total Received:</p>
                  <p>1,000,000 JBC</p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-gray-600 mb-2 font-bold">TOKEN HOLDINGS:</p>
                <button
                  className="w-full bg-[#F5B056] text-gray-800 p-2 rounded-md flex justify-between items-center"
                  onClick={() =>
                    setIsTokenHoldingsExpanded(!isTokenHoldingsExpanded)
                  }
                >
                  <span>$12,374 (23 tokens)</span>
                  <ChevronDown
                    className={`w-5 h-5 transform ${isTokenHoldingsExpanded ? "rotate-180" : ""
                      }`}
                  />
                </button>
                {isTokenHoldingsExpanded && (
                  <div className="mt-2 p-2 bg-gray-100 rounded-md">
                    <p>Token holdings details...</p>
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
                    Paid
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-bold">First seen:</span>
                  <span>May 05, 2024 at 05:06AM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-bold">Last seen:</span>
                  <span>Sep 28, 2024 at 23:59PM</span>
                </div>
                <div>
                  <p className="text-gray-600 mb-1 font-bold">Funded by:</p>
                  <a href="#" className="text-blue-500 hover:underline">
                    0x2Ad5526...04FB83a70
                  </a>
                </div>
                <div>
                  <p className="text-gray-600 mb-1 font-bold">
                    Multichain info:
                  </p>
                  <span className="bg-[#F5B056] text-gray-800 px-3 py-1 rounded-md inline-block">
                    $195.47 (Multichain portfolio)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <div className="w-full h-full flex flex-col relative z-10 font-exo2 mb">
        <div className="flex bg-[#1C2128] px-2 py-4 border-b border-b-white">
          <Button
            onClick={() => handleViewChange("transaction")}
            className={`mr-2 ml-14 border-2 transition-colors duration-300 ease-in-out ${activeView === "transaction"
              ? "bg-[#F5B056] text-white hover:bg-blue-700"
              : "bg-[#1C2128] text-gray-300 hover:bg-gray-900"
              }`}
          >
            Transaction history
          </Button>
          <Button
            onClick={() => handleViewChange("graph")}
            className={`border-2 transition-colors duration-300 ease-in-out ${activeView === "graph"
              ? "bg-[#F5B056] text-white hover:bg-blue-700"
              : "bg-gray-700 text-gray-300 hover:bg-gray-900"
              }`}
          >
            Transaction Graph
          </Button>
        </div>
        <div className="flex-grow flex">
          {activeView === "graph" && (
            <div className="w-full h-auto">
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={onNodeClick}
                onEdgeClick={onEdgeClick}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                fitView
                attributionPosition="bottom-left"
                maxZoom={2}
              >
                <Controls />
              </ReactFlow>
            </div>
          )}
          {/* Right panel for graph view */}
          {showRightPanel && (
            <div className="w-full lg:w-full xl:w-1/3 h-full overflow-hidden">
              <div className="h-full overflow-y-auto p-2 sm:p-4 space-y-4 bg-gray-800 bg-opacity-90">
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Filter</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <Select>
                        <SelectTrigger className="bg-gray-700 text-white border-gray-600">
                          <SelectValue placeholder="All txs" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-700 text-white border-gray-600">
                          <SelectItem value="all">All txs</SelectItem>
                          <SelectItem value="in">Incoming</SelectItem>
                          <SelectItem value="out">Outgoing</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select>
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
                        className="bg-gray-700 text-white border-gray-600"
                      />
                      <Input
                        placeholder="Maximum"
                        className="bg-gray-700 text-white border-gray-600"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <Input
                        type="date"
                        placeholder="dd/mm/yyyy"
                        className="bg-gray-700 text-white border-gray-600"
                      />
                      <Input
                        type="date"
                        placeholder="dd/mm/yyyy"
                        className="bg-gray-700 text-white border-gray-600"
                      />
                    </div>
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
                        className="bg-gray-700 text-white border-gray-600"
                      />
                    </div>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-gray-700">
                            <TableHead className="text-gray-400 w-16">Show</TableHead>
                            <TableHead className="text-gray-400">Sender</TableHead>
                            <TableHead className="text-gray-400">Txn</TableHead>
                            <TableHead className="text-gray-400">Eth</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {[1, 2, 3].map((i) => (
                            <TableRow key={i} className="border-gray-700">
                              <TableCell className="w-16">
                                <input type="checkbox" className="accent-blue-500" />
                              </TableCell>
                              <TableCell className="text-gray-300">0x483...f997</TableCell>
                              <TableCell className="text-gray-300">19.10</TableCell>
                              <TableCell className="text-gray-300">120.321</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-between mt-4 space-y-2 sm:space-y-0 sm:space-x-2">
                      <Button
                        variant="outline"
                        className="text-gray-900 border-gray-600 hover:bg-gray-700 w-full sm:w-auto"
                      >
                        Select all 0 rows
                      </Button>
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto">
                        Copy all addresses
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
          {/* Transaction table view */}
          {activeView === "transaction" && (
            <div className="w-full p-4 bg-gray-900 px-4 sm:px-6 lg:px-20">
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
                            <Eye
                              size={16}
                              className="text-gray-400 cursor-pointer hover:text-gray-600"
                            />
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
              {/* Transaction details modal */}
              <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
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
          )}
        </div>

        {isOpen && selectedEdge && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
            <div className="bg-[#1a2b4b] px-4 sm:px-6 pb-6 rounded-lg w-full max-w-4xl mx-auto overflow-hidden">
              <div className="flex justify-between items-center mt-6 mb-4">
                <h2 className="text-white text-xl sm:text-2xl font-semibold">
                  Transaction details
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
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
                      <th className="p-3 text-gray-950 text-left whitespace-nowrap">Time (UTC)</th>
                      <th className="p-3 text-gray-950 text-left whitespace-nowrap">Sender</th>
                      <th className="p-3 text-gray-950 text-left whitespace-nowrap">Recipient</th>
                      <th className="p-3 text-gray-950 text-left whitespace-nowrap">Amount</th>
                      <th className="p-3 text-gray-950 text-left whitespace-nowrap">TXID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactionsG.map((tx, index) => (
                      <tr key={index} className="border-b last:border-b-0">
                        <td className="px-3 sm:px-4 py-4 flex items-center">
                          <div className="rounded p-1 mr-2">
                            <input type="checkbox" className="w-4 h-4" />
                          </div>
                          <div className="text-gray-950 text-sm sm:text-base">{tx.time}</div>
                        </td>
                        <td className="text-gray-950 px-3 py-4 text-sm sm:text-base">{tx.sender}</td>
                        <td className="text-gray-950 px-3 py-4 text-sm sm:text-base">{tx.recipient}</td>
                        <td className="text-gray-950 px-3 py-4 text-sm sm:text-base">{tx.amount}</td>
                        <td className="text-gray-950 px-3 py-4 text-sm sm:text-base">
                          <span className="hidden sm:inline">{tx.txid}</span>
                          <span className="sm:hidden">{tx.txid.slice(0, 8)}...</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex flex-col sm:flex-row justify-between items-center mt-4 space-y-4 sm:space-y-0">
                <div className="flex items-center space-x-2">
                  <button className="bg-[#2a3b5b] text-gray-300 p-2 rounded hover:bg-[#3a4b6b]">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button className="bg-[#2a3b5b] text-white px-3 py-1 rounded">
                    1
                  </button>
                  <button className="bg-[#2a3b5b] text-gray-300 p-2 rounded hover:bg-[#3a4b6b]">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
                <button className="bg-transparent border border-red-500 text-red-500 px-4 py-2 rounded flex items-center hover:bg-red-500 hover:text-white transition-colors">
                  <Download className="w-5 h-5 mr-2" />
                  Export
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}