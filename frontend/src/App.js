import React, { useState } from 'react';
import TransactionForm from './components/TransactionForm';
import TrieVisualizer from './components/TrieVisualizer';
import ReceiptVisualizer from './components/ReceiptVisualizer';
import Trieviz from './components/Trieviz';
import * as CryptoJS from 'crypto-js'; // Import CryptoJS
 import './App.css';

function App() {
  const [transactions, setTransactions] = useState([]); // Store transactions
  const [receiptData, setReceiptData] = useState([]); // Store receipts

  // Function to handle adding a new transaction
  const addTransaction = (transaction) => {
    setTransactions((prevTransactions) => {
      // Handle nonce calculation
      const existingTransactions = prevTransactions.filter(
        (tx) =>
          tx.sender === transaction.sender && tx.receiver === transaction.receiver
      );
      const nonce = existingTransactions.length + 1;

      // Determine success or failure randomly
      const isSuccess = Math.random() > 0.3;
      const status = isSuccess ? 'Success' : 'Fail';

      // Prepare transaction and display appropriate alert
      const updatedTransaction = { ...transaction, nonce, status };
      const message = isSuccess
        ? `Transaction from ${transaction.sender} to ${transaction.receiver} for ${transaction.amount} ETH successful. Nonce: ${nonce}`
        : `Transaction from ${transaction.sender} to ${transaction.receiver} for ${transaction.amount} ETH failed.`;

      alert(message);

      // Create a receipt for the transaction with SHA-256 hashing
      const transactionString = `${transaction.sender}${transaction.receiver}${transaction.amount}${nonce}`;
      const transactionHash = CryptoJS.SHA256(transactionString).toString(CryptoJS.enc.Hex);

      const receipt = {
        sender: transaction.sender,
        receiver: transaction.receiver,
        amount: transaction.amount,
        status,
        nonce,
        transactionHash, // Use SHA-256 hash
        blockHash: CryptoJS.SHA256(transactionHash).toString(CryptoJS.enc.Hex), // Use SHA-256 for block hash as well
        gasUsed: Math.floor(Math.random() * 200000), // Simulated gas used
      };

      // Add the receipt to the receipt data state
      setReceiptData((prevReceipts) => [...prevReceipts, receipt]);

      // Return the updated list of transactions
      return [...prevTransactions, updatedTransaction];
    });
  };

  return (
    <div className="App">
      <h1>Blockchain Trie Visualizations</h1>

      {/* Merkle Patricia Trie Visualization - At the top */}
      <div className="merkle-container">
        <h2>Merkle Patricia Trie Visualizer</h2>
        <Trieviz />
      </div>

      {/* Transaction Form Section - Now below Merkle Patricia Trie */}
      <div className="form-container">
        <h2>Add New Transaction</h2>
        <TransactionForm addTransaction={addTransaction} />
      </div>

      {/* Visualization Section */}
      <div className="visualization-container">
        {/* Transaction Trie Visualization */}
        <div className="visualizer">
          <h2>Transaction Trie Visualization</h2>
          <TrieVisualizer transactions={transactions} />
        </div>

        {/* Receipt Trie Visualization */}
        <div className="visualizer">
          <h2>Receipt Trie Visualization</h2>
          <ReceiptVisualizer receipts={receiptData} />
        </div>
      </div>
    </div>
  );
}

export default App;
