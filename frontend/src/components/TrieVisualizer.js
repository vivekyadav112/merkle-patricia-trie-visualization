import React, { useEffect } from 'react';
import * as d3 from 'd3';
import './TrieVisualizer.css';

const TrieVisualizer = ({ transactions = [] }) => {
  const renderTrie = (data) => {
    const width = document.getElementById('trie-container').offsetWidth;
    const height = document.getElementById('trie-container').offsetHeight;

    const svg = d3.select('#trie-graph')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMinYMin meet')
      .style('display', 'block')
      .style('margin', '0 auto');

    svg.selectAll('*').remove(); // Clear previous renders

    const root = d3.hierarchy(data);
    
    // Calculate dimensions
    const nodeSize = { width: 60, height: 100 };
    const margin = { top: 80, right: 30, bottom: 30, left: 30 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Configure tree layout
    const treeLayout = d3.tree()
      .size([innerWidth, innerHeight]);

    // Create container group with exact center translation
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Apply layout
    treeLayout(root);

    // Center the root node and adjust all positions
    const centerX = innerWidth / 2;
    root.descendants().forEach(d => {
      d.x = d.x - (root.x - centerX);
    });

    // Render links
    const links = g.selectAll('.link')
      .data(root.links())
      .enter()
      .append('line')
      .attr('class', 'link')
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y)
      .attr('stroke', '#ccc')
      .attr('stroke-width', 2);

    // Render nodes with centered coordinates
    const nodes = g.selectAll('.node')
      .data(root.descendants())
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.x}, ${d.y})`);

    // Render circles with color based on transaction status
    nodes
      .append('circle')
      .attr('r', 15)
      .attr('fill', (d) => (d.data.details?.status === 'Fail' ? 'red' : 'black'));

    // Render node text
    nodes
      .append('text')
      .attr('dy', '.35em')
      .attr('text-anchor', 'middle')
      .style('font-size', '10px')
      .text((d) => d.data.name);

    // Apply 'failed' class to nodes with failed transactions
    nodes
      .attr('class', (d) => `node ${d.data.details?.status === 'Fail' ? 'failed' : ''}`);

    // Append transaction details to each node if it's a transaction node
    nodes
      .filter((d) => d.data.details)
      .append('text')
      .attr('dy', '1.5em')
      .attr('text-anchor', 'middle')
      .style('font-size', '8px')
      .style('fill', '#333')
      .text((d) => {
        const details = d.data.details;
        return `Sender: ${details.sender || 'N/A'}\nReceiver: ${details.receiver || 'N/A'}\nAmount: ${details.amount || 'N/A'}\nNonce: ${details.nonce || 'N/A'}\nStatus: ${details.status}`;
      });
  };

  useEffect(() => {
    const data = {
      name: 'Transaction Trie',
      children: transactions.map((tx, index) => ({
        name: `Tx ${index + 1}`,
        details: {
          sender: tx.sender,
          receiver: tx.receiver,
          amount: tx.amount,
          nonce: tx.nonce,
          status: tx.status, // Includes status for color coding
        },
      })),
    };

    renderTrie(data);
  }, [transactions]);

  return (
    <div className="trie-container" id="trie-container">
      <svg id="trie-graph"></svg>
    </div>
  );
};

export default TrieVisualizer;
