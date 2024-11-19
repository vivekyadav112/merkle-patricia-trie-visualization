import React, { useState } from "react";
import ReactFlow, { Controls } from "react-flow-renderer";
import dagre from "dagre";
import './Trieviz.css';

const TrieVisualizer = () => {
  const [selectedTrie, setSelectedTrie] = useState("Merkle Patricia Trie");
  const [key, setKey] = useState("");
  const [value, setValue] = useState("");
  const [trieData, setTrieData] = useState({
    "Merkle Patricia Trie": {},
    "Storage Trie": {},
    "Transaction Trie": {},
    "Receipt Trie": {},
  });
  const [isGraphView, setIsGraphView] = useState(false);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  const handleInsert = () => {
    if (!key || !value) return;

    const updatedData = { ...trieData };

    // Update all tries automatically
    updatedData["Merkle Patricia Trie"][key] = value;
    updatedData["Storage Trie"][key] = value;
    updatedData["Transaction Trie"][key] = { data: value };
    updatedData["Receipt Trie"][key] = { status: "success", data: value };

    setTrieData(updatedData);
    updateVisualization(updatedData[selectedTrie]);
  };

  const handleDelete = () => {
    if (!key) return;

    const updatedData = { ...trieData };

    // Delete key from all tries
    delete updatedData["Merkle Patricia Trie"][key];
    delete updatedData["Storage Trie"][key];
    delete updatedData["Transaction Trie"][key];
    delete updatedData["Receipt Trie"][key];

    setTrieData(updatedData);
    updateVisualization(updatedData[selectedTrie]);
  };

  const handleModify = () => {
    handleInsert(); // Modify is essentially reinserting with the new value.
  };

  const updateVisualization = (data) => {
    if (isGraphView) {
      updateGraph(data);
    }
  };

  const updateGraph = (data) => {
    const newNodes = [{ 
      id: "root", 
      data: { label: "root" }, 
      position: { x: 0, y: 0 },
      style: {
        background: "#f5f5f5",
        border: "1px solid #ccc",
        padding: "10px",
        borderRadius: "5px",
      }
    }];
    const newEdges = [];
    const nodePositions = {};
    
    // Create a new directed graph
    const g = new dagre.graphlib.Graph();
    g.setGraph({ 
      rankdir: "TB", 
      nodesep: 70, 
      ranksep: 80,
      marginx: 20,
      marginy: 40
    });
    g.setDefaultEdgeLabel(() => ({}));

    // Add root node first
    g.setNode("root", { width: 100, height: 40 });

    // Function to recursively create nodes and edges
    const addNode = (parent, keyPart, value = null) => {
      const id = value ? `${parent}/${keyPart}:${value}` : `${parent}/${keyPart}`;
      if (!newNodes.find((node) => node.id === id)) {
        // Add node to dagre graph for layout calculation
        g.setNode(id, { width: 150, height: 40 });
        
        // Add node to our visualization
        newNodes.push({
          id,
          data: { label: value ? `${keyPart}: ${value}` : keyPart },
          position: { x: 0, y: 0 }, // Will be updated by dagre
          style: {
            background: value ? "#e3f2fd" : "#f5f5f5",
            border: "1px solid #ccc",
            padding: "10px",
            borderRadius: "5px",
            fontSize: "12px",
          }
        });

        // Add edge to both dagre and our visualization
        g.setEdge(parent, id);
        newEdges.push({
          id: `${parent}-${id}`,
          source: parent,
          target: id,
          style: { stroke: "#888" },
          type: "smoothstep",
        });
      }
      return id;
    };

    // Process all key-value pairs
    Object.entries(data).forEach(([key, value]) => {
      let parent = "root";
      const keyParts = key.split("");
      
      // Add intermediate nodes for each character in the key
      keyParts.forEach((part, index) => {
        if (index === keyParts.length - 1) {
          // Last node should show the value
          parent = addNode(parent, part, value);
        } else {
          parent = addNode(parent, part);
        }
      });
    });

    // Calculate layout using dagre
    dagre.layout(g);

    // Apply calculated positions to nodes
    newNodes.forEach((node) => {
      const dagreNode = g.node(node.id);
      node.position = {
        x: dagreNode.x - dagreNode.width / 2,
        y: dagreNode.y - dagreNode.height / 2,
      };
    });

    setNodes(newNodes);
    setEdges(newEdges);
  };

  const getTextVisualization = () => {
    const data = trieData[selectedTrie];

    // Helper function for formatting Merkle Patricia Trie as a hierarchy
    const formatKey = (key, value, level = 0) => {
      const indent = "  ".repeat(level);
      let result = `${indent}[${key[0]}]\n`;
      if (key.length > 1) {
        result += formatKey(key.slice(1), value, level + 1);
      } else {
        result += `${"  ".repeat(level + 1)}Value: ${value}\n`;
        const simulatedHash = "5994471abb0112afcc18159f6cc74b4f511b99806da59b3caf5a9c173cafc5";
        result += `${"  ".repeat(level + 1)}Hash: ${simulatedHash}\n`;
      }
      return result;
    };

    // Handle different trie types
    if (selectedTrie === "Merkle Patricia Trie") {
      const output = Object.entries(data)
        .map(([key, value]) => formatKey(key, value))
        .join("");
      return `${selectedTrie}:\n${output}`;
    } else if (selectedTrie === "Storage Trie") {
      return Object.entries(data)
        .map(([key, value]) => `Storage: ${key} => ${value}\n`)
        .join("");
    } else if (selectedTrie === "Transaction Trie") {
      return Object.entries(data)
        .map(([key, value]) => `Transaction ID: ${key} => ${JSON.stringify(value)}\n`)
        .join("");
    } else if (selectedTrie === "Receipt Trie") {
      return Object.entries(data)
        .map(([key, value]) => `Receipt ID: ${key} => ${JSON.stringify(value)}\n`)
        .join("");
    }
    return ""; // Default fallback
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Trie Visualizer</h1>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div style={{ flex: 1, marginRight: "20px", border: "1px solid black", height: "600px" }}>
          {isGraphView ? (
            <ReactFlow nodes={nodes} edges={edges} style={{ width: "100%", height: "100%" }}>
              <Controls />
            </ReactFlow>
          ) : (
            <div style={{ padding: "20px", textAlign: "center" }}>
              <p>Click "Show Diagram" to view the graph visualization</p>
            </div>
          )}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ 
            border: "1px solid black", 
            padding: "15px", 
            height: "200px", 
            marginBottom: "20px",
            overflowY: "auto",
            fontFamily: "monospace",
            backgroundColor: "#f5f5f5"
          }}>
            <textarea
              readOnly
              value={getTextVisualization()}
              style={{ 
                width: "100%", 
                height: "100%", 
                border: "none",
                backgroundColor: "transparent",
                resize: "none",
                outline: "none"
              }}
            />
          </div>

          <div style={{ marginTop: "20px" }}>
            <button 
              onClick={() => setIsGraphView(!isGraphView)} 
              style={{ 
                marginBottom: "20px", 
                padding: "8px 16px",
                width: "100%"
              }}
            >
              {isGraphView ? "Hide Diagram" : "Show Diagram"}
            </button>

            <div>
              <label>Selected Trie:</label>
              <select value={selectedTrie} onChange={(e) => setSelectedTrie(e.target.value)}>
                <option>Merkle Patricia Trie</option>
                <option>Storage Trie</option>
                <option>Transaction Trie</option>
                <option>Receipt Trie</option>
              </select>
            </div>

            <div style={{ marginTop: "20px" }}>
              <input
                type="text"
                placeholder="Key"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                style={{ marginBottom: "30px", padding: "5px" }}
              />
              <input
                type="text"
                placeholder="Value"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                style={{ marginBottom: "10px", padding: "5px" }}
              />
            </div>
            <div>
              <button onClick={handleInsert} style={{ marginRight: "10px" }}>
                Insert
              </button>
              <button onClick={handleDelete} style={{ marginRight: "10px" }}>
                Delete
              </button>
              <button onClick={handleModify}>
                Modify
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrieVisualizer;
