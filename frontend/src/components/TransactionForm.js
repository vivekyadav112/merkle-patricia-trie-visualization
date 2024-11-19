import React, { useState } from 'react';
import './TransactionForm.css';

const TransactionForm = ({ addTransaction }) => {
  const [transaction, setTransaction] = useState({
    sender: '',
    receiver: '',
    amount: '',
  });

  // Handle input changes for transaction fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTransaction((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleTransactionSubmit = (e) => {
    e.preventDefault();

    if (transaction.sender && transaction.receiver && transaction.amount) {
      // Ensure the transaction fields are passed to the parent component
      addTransaction(transaction);
      setTransaction({ sender: '', receiver: '', amount: '' });
    } else {
      alert('Please fill in all fields!');
    }
  };

  return (
    <div>
      <h2>Transaction Input</h2>
      <form onSubmit={handleTransactionSubmit}>
        <div>
          <label>Sender Address: </label>
          <input
            type="text"
            name="sender"
            value={transaction.sender}
            onChange={handleInputChange}
            placeholder="Sender Address"
            required
          />
        </div>
        <div>
          <label>Receiver Address: </label>
          <input
            type="text"
            name="receiver"
            value={transaction.receiver}
            onChange={handleInputChange}
            placeholder="Receiver Address"
            required
          />
        </div>
        <div>
          <label>Amount (ETH): </label>
          <input
            type="number"
            name="amount"
            value={transaction.amount}
            onChange={handleInputChange}
            placeholder="Amount"
            min="0.01"
            step="0.01"
            required
          />
        </div>
        <button type="submit">Add Transaction</button>
      </form>
    </div>
  );
};

export default TransactionForm;
