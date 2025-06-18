'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Units } from '@/data/units';
import { Projects } from '@/data/projects';
import { Payments } from '@/data/payments';
import { Invoices } from '@/data/invoices';

export default function UnitDetailPage() {
  const params = useParams();
  const unitId = parseInt(params.unitId);
  const unit = Units.find(u => u.id == unitId);
  
  if (!unit) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Unit Not Found</h1>
          <p className="text-gray-600 mb-4">The unit you're looking for doesn't exist.</p>
          <Link href="/units" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            Back to Units
          </Link>
        </div>
      </div>
    );
  }

  const project = Projects.find(p => p.id === unit.projectId);
  const unitPayments = Payments.filter(p => p.unitId === unitId);
  const unitInvoices = Invoices.filter(i => i.unitId === unitId);

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

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <Link href="/units" className="hover:text-blue-600">Units</Link>
          <span>/</span>
          <span>Unit {unit.unitNumber}</span>
        </div>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Unit {unit.unitNumber}
            </h1>
            <p className="text-gray-600">{project?.name}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(unit.status)}`}>
            {unit.status.charAt(0).toUpperCase() + unit.status.slice(1)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Unit Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Unit Number</label>
                  <p className="text-lg font-semibold text-gray-900">{unit.unitNumber}</p>
                </div>
                            <div>
                  <label className="block text-sm font-medium text-gray-700">Unit Number</label>
                  <p className="text-lg font-semibold text-gray-900">{unit.unitNumber}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <p className="text-lg font-semibold text-gray-900">{unit.type}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Floor</label>
                  <p className="text-lg font-semibold text-gray-900">{unit.floor}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Square Feet</label>
                  <p className="text-lg font-semibold text-gray-900">{unit.sqft.toLocaleString()} sq ft</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Bedrooms</label>
                  <p className="text-lg font-semibold text-gray-900">{unit.bedrooms}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Bathrooms</label>
                  <p className="text-lg font-semibold text-gray-900">{unit.bathrooms}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Price</label>
                  <p className="text-2xl font-bold text-gray-900">{formatPrice(unit.price)}</p>
                  <p className="text-sm text-gray-600">{formatPrice(Math.round(unit.price / unit.sqft))}/sq ft</p>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
            <p className="text-gray-700 leading-relaxed">{unit.description}</p>
          </div>

          {/* Features */}
          {unit.features && unit.features.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {unit.features.map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Project Information */}
          {project && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Project Information</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Project Name</label>
                  <Link href={`/projects/${project.id}`} className="text-blue-600 hover:text-blue-800 font-medium">
                    {project.name}
                  </Link>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Location</label>
                  <p className="text-gray-900">{project.location}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <p className="text-gray-900">{project.address}, {project.city}, {project.state} {project.zipCode}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Developer</label>
                  <p className="text-gray-900">{project.developer}</p>
                </div>
              </div>
            </div>
          )}

          {/* Payments History */}
          {unitPayments.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment History</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Method
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Transaction ID
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {unitPayments.map((payment) => (
                      <tr key={payment.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(payment.paymentDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatPrice(payment.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {payment.paymentMethod.replace('_', ' ').toUpperCase()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                            payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {payment.transactionId}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Invoices */}
          {unitInvoices.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Invoices</h2>
              <div className="space-y-4">
                {unitInvoices.map((invoice) => (
                  <div key={invoice.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <Link href={`/invoices/${invoice.id}`} className="text-blue-600 hover:text-blue-800 font-medium">
                          {invoice.invoiceNumber}
                        </Link>
                        <p className="text-sm text-gray-600">{invoice.description}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                        invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Issue Date:</span>
                        <p className="font-medium">{formatDate(invoice.issueDate)}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Due Date:</span>
                        <p className="font-medium">{formatDate(invoice.dueDate)}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Amount:</span>
                        <p className="font-medium">{formatPrice(invoice.totalAmount)}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Paid Date:</span>
                        <p className="font-medium">
                          {invoice.paidDate ? formatDate(invoice.paidDate) : 'Not paid'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Information */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Information</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Current Status</label>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(unit.status)}`}>
                  {unit.status.charAt(0).toUpperCase() + unit.status.slice(1)}
                </span>
              </div>
              
              {unit.status === 'reserved' && unit.reservedBy && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Reserved By</label>
                    <p className="text-gray-900">Buyer ID: {unit.reservedBy}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Reserved Date</label>
                    <p className="text-gray-900">{formatDate(unit.reservedDate)}</p>
                  </div>
                </>
              )}
              
              {unit.status === 'sold' && unit.soldTo && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Sold To</label>
                    <p className="text-gray-900">Buyer ID: {unit.soldTo}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Sold Date</label>
                    <p className="text-gray-900">{formatDate(unit.soldDate)}</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Financial Summary */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Unit Price:</span>
                <span className="font-semibold">{formatPrice(unit.price)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Price per sq ft:</span>
                <span className="font-semibold">{formatPrice(Math.round(unit.price / unit.sqft))}</span>
              </div>
              {unitPayments.length > 0 && (
                <>
                  <hr className="my-3" />
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Payments:</span>
                    <span className="font-semibold text-green-600">
                      {formatPrice(unitPayments.reduce((sum, payment) => 
                        payment.status === 'completed' ? sum + payment.amount : sum, 0
                      ))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Count:</span>
                    <span className="font-semibold">{unitPayments.length}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Timestamps */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Created</label>
                <p className="text-gray-900">{formatDate(unit.createdAt)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Updated</label>
                <p className="text-gray-900">{formatDate(unit.updatedAt)}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
                          <div className="space-y-3">
              <Link
                href={`/units/${unit.id}/edit`}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors text-center block"
              >
                Edit Unit
              </Link>
              
              {project && (
                <Link
                  href={`/projects/${project.id}`}
                  className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors text-center block"
                >
                  View Project
                </Link>
              )}
              
              {unitInvoices.length > 0 && (
                <Link
                  href={`/invoices?unitId=${unit.id}`}
                  className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors text-center block"
                >
                  View All Invoices
                </Link>
              )}
              
              {unitPayments.length > 0 && (
                <Link
                  href={`/payments?unitId=${unit.id}`}
                  className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors text-center block"
                >
                  View All Payments
                </Link>
              )}
              
              <button
                onClick={() => window.print()}
                className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                Print Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
