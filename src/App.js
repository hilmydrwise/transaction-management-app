import React, { useState, useEffect } from 'react';
import './App.css';

const App = () => {
  // State management
  const [transactions, setTransactions] = useState([]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('income');
  const [filter, setFilter] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const [errors, setErrors] = useState({});

  // Load transactions from localStorage on component mount
  useEffect(() => {
    const savedTransactions = localStorage.getItem('transactions');
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    }
  }, []);

  // Save transactions to localStorage whenever transactions change
  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    
    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!amount.trim()) {
      newErrors.amount = 'Amount is required';
    } else if (isNaN(amount) || parseFloat(amount) <= 0) {
      newErrors.amount = 'Amount must be a positive number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Add new transaction
  const addTransaction = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const newTransaction = {
      id: Date.now(),
      description: description.trim(),
      amount: parseFloat(amount),
      type,
      date: new Date().toLocaleDateString()
    };

    setTransactions([...transactions, newTransaction]);
    
    // Reset form
    setDescription('');
    setAmount('');
    setType('income');
    setErrors({});
  };

  // Delete transaction
  const deleteTransaction = (id) => {
    setTransactions(transactions.filter(transaction => transaction.id !== id));
    setShowDeleteModal(false);
    setTransactionToDelete(null);
  };

  // Show delete confirmation
  const confirmDelete = (transaction) => {
    setTransactionToDelete(transaction);
    setShowDeleteModal(true);
  };

  // Calculate totals
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalIncome - totalExpenses;

  // Filter transactions
  const filteredTransactions = transactions.filter(transaction => {
    if (filter === 'all') return true;
    return transaction.type === filter;
  });

  return (
    <div className="app">
      <div className="container">
        <header className="app-header">
          <h1>Transaction Management App</h1>
        </header>

        {/* Balance Summary */}
        <div className="balance-summary">
          <div className="balance-card income">
            <h3>Total Income</h3>
            <p className="amount">${totalIncome.toFixed(2)}</p>
          </div>
          <div className="balance-card expense">
            <h3>Total Expenses</h3>
            <p className="amount">${totalExpenses.toFixed(2)}</p>
          </div>
          <div className={`balance-card net ${netBalance >= 0 ? 'positive' : 'negative'}`}>
            <h3>Net Balance</h3>
            <p className="amount">${netBalance.toFixed(2)}</p>
          </div>
        </div>

        {/* Add Transaction Form */}
        <div className="add-transaction">
          <h2>Add New Transaction</h2>
          <form onSubmit={addTransaction} className="transaction-form">
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <input
                type="text"
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={errors.description ? 'error' : ''}
                placeholder="Enter transaction description"
              />
              {errors.description && <span className="error-message">{errors.description}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="amount">Amount</label>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={errors.amount ? 'error' : ''}
                placeholder="0.00"
                step="0.01"
                min="0"
              />
              {errors.amount && <span className="error-message">{errors.amount}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="type">Type</label>
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary">
              Add Transaction
            </button>
          </form>
        </div>

        {/* Filter Buttons */}
        <div className="filter-buttons">
          <button
            className={`btn ${filter === 'all' ? 'btn-active' : 'btn-secondary'}`}
            onClick={() => setFilter('all')}
          >
            All Transactions
          </button>
          <button
            className={`btn ${filter === 'income' ? 'btn-active' : 'btn-secondary'}`}
            onClick={() => setFilter('income')}
          >
            Income Only
          </button>
          <button
            className={`btn ${filter === 'expense' ? 'btn-active' : 'btn-secondary'}`}
            onClick={() => setFilter('expense')}
          >
            Expenses Only
          </button>
        </div>

        {/* Transactions Table */}
        <div className="transactions-section">
          <h2>Transactions</h2>
          {filteredTransactions.length === 0 ? (
            <div className="no-transactions">
              <p>No transactions found. Add your first transaction above!</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="transactions-table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Amount</th>
                    <th>Type</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map(transaction => (
                    <tr key={transaction.id}>
                      <td>{transaction.description}</td>
                      <td className={`amount ${transaction.type}`}>
                        ${transaction.amount.toFixed(2)}
                      </td>
                      <td>
                        <span className={`type-badge ${transaction.type}`}>
                          {transaction.type}
                        </span>
                      </td>
                      <td>{transaction.date}</td>
                      <td>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => confirmDelete(transaction)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>Confirm Delete</h3>
              <p>Are you sure you want to delete this transaction?</p>
              <div className="modal-details">
                <strong>{transactionToDelete?.description}</strong> - ${transactionToDelete?.amount.toFixed(2)}
              </div>
              <div className="modal-actions">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => deleteTransaction(transactionToDelete.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;