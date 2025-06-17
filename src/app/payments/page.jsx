'use client';
import React, { useState } from 'react';
import transactions from '@/app/payments/data'; // Adjust the import path as necessary
import { Search, Filter, Download, Eye, Calendar, DollarSign, Home, User, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import Sidebar from '@/components/layout/sidebar'; // Adjust the import path as necessary
const RealEstateTransactions = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedTransaction, setExpandedTransaction] = useState(null);
  const [dateRange, setDateRange] = useState('all');


  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.property.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.buyer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.seller.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = selectedFilter === 'all' || transaction.type.toLowerCase().includes(selectedFilter.toLowerCase());
    
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'Processing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 overflow-y-auto bg-gray-50">
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-600 rounded-xl">
                <Home className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-800">Real Estate Transactions</h1>
                <p className="text-slate-600">Comprehensive transaction statements and records</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors">
                <Download className="w-5 h-5" />
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Total Volume</p>
                  <p className="text-2xl font-bold">$10.7M</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-200" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Active Deals</p>
                  <p className="text-2xl font-bold">12</p>
                </div>
                <FileText className="w-8 h-8 text-blue-200" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-purple-500 to-violet-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">Properties</p>
                  <p className="text-2xl font-bold">89</p>
                </div>
                <Home className="w-8 h-8 text-purple-200" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100">Clients</p>
                  <p className="text-2xl font-bold">156</p>
                </div>
                <User className="w-8 h-8 text-orange-200" />
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search transactions, properties, or clients..."
                className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
            >
              <option value="all">All Transactions</option>
              <option value="purchase">Purchases</option>
              <option value="sale">Sales</option>
              <option value="refinancing">Refinancing</option>
              <option value="rental">Rentals</option>
              <option value="investment">Investments</option>
            </select>
            <select
              className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
            </select>
          </div>
        </div>

        {/* Transactions List */}
        <div className="space-y-4">
          {filteredTransactions.map((transaction) => (
            <div key={transaction.id} className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-slate-100 rounded-xl">
                      <FileText className="w-6 h-6 text-slate-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-slate-800">{transaction.type}</h3>
                      <p className="text-slate-600">{transaction.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(transaction.status)}`}>
                      {transaction.status}
                    </span>
                    <span className="text-2xl font-bold text-slate-800">{formatCurrency(transaction.amount)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-slate-500">Property</p>
                    <p className="font-medium text-slate-800">{transaction.property}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Date</p>
                    <p className="font-medium text-slate-800">{formatDate(transaction.date)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Agent</p>
                    <p className="font-medium text-slate-800">{transaction.agent}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="flex items-center space-x-6">
                    <div>
                      <p className="text-sm text-slate-500">Buyer</p>
                      <p className="font-medium text-slate-800">{transaction.buyer}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Seller</p>
                      <p className="font-medium text-slate-800">{transaction.seller}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setExpandedTransaction(expandedTransaction === transaction.id ? null : transaction.id)}
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    <Eye className="w-4 h-4" />
                    <span>{expandedTransaction === transaction.id ? 'Hide Details' : 'View Details'}</span>
                    {expandedTransaction === transaction.id ? 
                      <ChevronUp className="w-4 h-4" /> : 
                      <ChevronDown className="w-4 h-4" />
                    }
                  </button>
                </div>

                {/* Expanded Details */}
                {expandedTransaction === transaction.id && (
                  <div className="mt-6 pt-6 border-t border-slate-100">
                    <h4 className="text-lg font-semibold text-slate-800 mb-4">Transaction Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        {Object.entries(transaction.details).slice(0, Math.ceil(Object.entries(transaction.details).length / 2)).map(([key, value]) => (
                          <div key={key} className="flex justify-between items-center py-2 border-b border-slate-50">
                            <span className="text-slate-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                            <span className="font-semibold text-slate-800">
                              {typeof value === 'number' ? formatCurrency(value) : value}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="space-y-3">
                        {Object.entries(transaction.details).slice(Math.ceil(Object.entries(transaction.details).length / 2)).map(([key, value]) => (
                          <div key={key} className="flex justify-between items-center py-2 border-b border-slate-50">
                            <span className="text-slate-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                            <span className="font-semibold text-slate-800">
                              {typeof value === 'number' ? formatCurrency(value) : value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredTransactions.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-600 mb-2">No transactions found</h3>
            <p className="text-slate-500">Try adjusting your search criteria or filters</p>
          </div>
        )}
      </div>
    </div>
    </div>
    </div>
  );
};

export default RealEstateTransactions;