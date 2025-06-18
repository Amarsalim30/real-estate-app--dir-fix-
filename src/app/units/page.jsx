"use client";

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Units } from '@/data/units';
import { Projects } from '@/data/projects';

export default function UnitsPage() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');
  const [sortBy, setSortBy] = useState('unitNumber');
  const [sortOrder, setSortOrder] = useState('asc');

  // Get unique values for filters
  const unitTypes = [...new Set(Units.map(unit => unit.type))];
  const projectOptions = Projects.map(project => ({ id: project.id, name: project.name }));

  // Filter and sort units
  const filteredAndSortedUnits = useMemo(() => {
    let filtered = Units.filter(unit => {
      const statusMatch = statusFilter === 'all' || unit.status === statusFilter;
      const typeMatch = typeFilter === 'all' || unit.type === typeFilter;
      const projectMatch = projectFilter === 'all' || unit.projectId === parseInt(projectFilter);
      
      return statusMatch && typeMatch && projectMatch;
    });

    // Sort units
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'price' || sortBy === 'sqft') {
        aValue = Number(aValue);
        bValue = Number(bValue);
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [statusFilter, typeFilter, projectFilter, sortBy, sortOrder]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'reserved':
        return 'bg-yellow-100 text-yellow-800';
      case 'sold':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getProjectName = (projectId) => {
    const project = Projects.find(p => p.id === projectId);
    return project ? project.name : 'Unknown Project';
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Units</h1>
        <p className="text-gray-600">Manage and view all property units</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full border text-gray-700 border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="available">Available</option>
              <option value="reserved">Reserved</option>
              <option value="sold">Sold</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              {unitTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project
            </label>
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Projects</option>
              {projectOptions.map(project => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="unitNumber">Unit Number</option>
              <option value="price">Price</option>
              <option value="sqft">Square Feet</option>
              <option value="type">Type</option>
              <option value="floor">Floor</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Order
            </label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="mb-6">
        <p className="text-gray-600">
          Showing {filteredAndSortedUnits.length} of {Units.length} units
        </p>
      </div>

      {/* Units Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAndSortedUnits.map((unit) => (
          <div key={unit.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Unit {unit.unitNumber}
                  </h3>
                  <p className="text-sm text-gray-600">{getProjectName(unit.projectId)}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(unit.status)}`}>
                  {unit.status.charAt(0).toUpperCase() + unit.status.slice(1)}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Type:</span>
                  <span className="text-sm font-medium">{unit.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Floor:</span>
                  <span className="text-sm font-medium">{unit.floor}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Size:</span>
                  <span className="text-sm font-medium">{unit.sqft.toLocaleString()} sq ft</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Bedrooms:</span>
                  <span className="text-sm font-medium">{unit.bedrooms}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Bathrooms:</span>
                  <span className="text-sm font-medium">{unit.bathrooms}</span>
                </div>
              </div>

              <div className="mb-4">
                <div className="text-2xl font-bold text-gray-900">
                  {formatPrice(unit.price)}
                </div>
                <div className="text-sm text-gray-600">
                  {formatPrice(Math.round(unit.price / unit.sqft))}/sq ft
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {unit.description}
              </p>

              <div className="flex justify-between items-center">
                <Link
                  href={`/units/${unit.id}`}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  View Details
                </Link>
                <div className="text-xs text-gray-500">
                  Updated {unit.updatedAt.toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredAndSortedUnits.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-2">No units found</div>
          <p className="text-gray-400">Try adjusting your filters to see more results.</p>
        </div>
      )}
    </div>
  );
}
