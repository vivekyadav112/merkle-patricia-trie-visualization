import React, { useEffect } from 'react';
import * as d3 from 'd3';
import './ReceiptVisualizer.css';

const ReceiptVisualizer = ({ receipts = [] }) => {
  const renderTrie = (data) => {
    const width = document.getElementById('receipt-container').offsetWidth;
    const height = document.getElementById('receipt-container').offsetHeight;

    const svg = d3.select('#receipt-graph')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMinYMin meet')
      .style('display', 'block')
      .style('margin', '0 auto');

    svg.selectAll('*').remove(); // Clear previous renders

    const root = d3.hierarchy(data);
    
    // Calculate dimensions with top margin
    const margin = { top: 120, right: 30, bottom: 30, left: 30 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Configure tree layout with adjusted dimensions
    const treeLayout = d3.tree()
      .size([innerWidth, innerHeight]);

    // Create container group with translation for top margin
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Apply layout
    treeLayout(root);

    // Center the root node and adjust all positions
    const centerX = innerWidth / 2;
    root.descendants().forEach(d => {
      d.x = d.x - (root.x - centerX);
    });

    // Render links with adjusted coordinates
    g.selectAll('.link')
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

    // Render nodes with adjusted coordinates
    const nodes = g.selectAll('.node')
      .data(root.descendants())
      .enter()
      .append('g')
      .attr('class', (d) => `node ${d.data.status === 'Fail' ? 'failed' : ''}`)
      .attr('transform', d => `translate(${d.x}, ${d.y})`);

    // Append circles to nodes
    nodes
      .append('circle')
      .attr('r', 15)
      .attr('fill', (d) => (d.data.status === 'Fail' ? 'red' : '#69b3a2')) // Red for failed receipts, green for others
      .attr('stroke', (d) => (d.data.status === 'Fail' ? 'darkred' : 'green'))
      .attr('stroke-width', 2);

    // Append node names
    nodes
      .append('text')
      .attr('dy', '.35em')
      .attr('text-anchor', 'middle')
      .style('font-size', '10px')
      .text((d) => d.data.name);

    // Append receipt details
    nodes
      .append('text')
      .attr('dy', '1.5em')
      .attr('text-anchor', 'middle')
      .style('font-size', '8px')
      .style('fill', 'black')
      .text((d) => `Status: ${d.data.status}`);
  };

  useEffect(() => {
    const data = {
      name: 'Receipt Trie',
      children: receipts.map((receipt, index) => ({
        name: `Receipt ${index + 1}`,
        status: receipt.status,
      })),
    };

    renderTrie(data);
  }, [receipts]);

  return (
    <div className="receipt-container" id="receipt-container">
      <svg id="receipt-graph"></svg>
    </div>
  );
};

export default ReceiptVisualizer;
