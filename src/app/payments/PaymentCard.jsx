'use client';
import { useState } from 'react';
import { PaymentStatuses, PaymentMethods } from '@/data/payments';
import { formatPrice } from '@/utils/format';
import { 
  CreditCard,
  Calendar,
  DollarSign,
  User,
  Building,
  CheckCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
  Eye,
  Download,
  ChevronDown,
  ChevronUp,
  FileText,
  TrendingUp
} from 'lucide-react';

const StatusBadge = ({ status }) => {
  const statusConfig = {
    [PaymentStatuses.COMPLETED]: { 
      color: 'bg-green-100 text-green-800', 
      icon: CheckCircle, 
      label: 'Completed' 
    },
    [PaymentStatuses.PENDING]: { 
      color: 'bg-yellow-100 text-yellow-800', 
      icon: Clock, 
      label: 'Pending' 
    },
    [PaymentStatuses.FAILED]: { 
      color: 'bg-red-100 text-red-800', 
      icon: AlertTriangle, 
      label: 'Failed' 
    },
    [PaymentStatuses.REFUNDED]: { 
      color: 'bg-gray-100 text-gray-800', 
      icon: RefreshCw, 
      label: 'Refunded' 
    }
  };

  const config = statusConfig[status] || statusConfig[PaymentStatuses.PENDING];
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
    </span>
  );
};

const PaymentMethodIcon = ({ method }) => {
  switch (method) {
    case PaymentMethods.CREDIT_CARD:
      return <CreditCard className="w-4 h-4 text-blue-600" />;
    case PaymentMethods.WIRE_TRANSFER:
      return <TrendingUp className="w-4 h-4 text-green-600" />;
    case PaymentMethods.CHECK:
      return <FileText className="w-4 h-4 text-purple-600" />;
    case PaymentMethods.ACH:
      return <Building className="w-4 h-4 text-orange-600" />;
    case PaymentMethods.CASH:
      return <DollarSign className="w-4 h-4 text-yellow-600" />;
    case PaymentMethods.MPESA_STKPUSH:
      return <DollarSign className="w-4 h-4 text-green-600" />;
    case PaymentMethods.MPESA_PAYBILL:
      return <DollarSign className="w-4 h-4 text-green-600" />;
    default:
      return <CreditCard className="w-4 h-4 text-gray-600" />;
  }
};

export default function PaymentCard({ payment, onView, isAdmin }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-lg border shadow-sm">
      {/* Main Card Content */}
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <PaymentMethodIcon method={payment.paymentMethod} />
            </div>
            <div>
              <p className="font-medium text-gray-900 text-sm">
                {payment.transactionId}
              </p>
              <p className="text-xs text-gray-500">
                {new Date(payment.paymentDate).toLocaleDateString()}
              </p>
            </div>
          </div>
          <StatusBadge status={payment.status} />
        </div>

        {/* Amount */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <DollarSign className="w-4 h-4 text-gray-400" />
            <span className="text-lg font-bold text-gray-900">
              {formatPrice(payment.amount)}
            </span>
          </div>
          <span className="text-sm text-gray-500 capitalize">
            {payment.paymentMethod?.replace('_', ' ') || '—'}
          </span>
        </div>

        {/* Customer Info (Admin Only) */}
        {isAdmin && payment.buyer && (
          <div className="flex items-center space-x-2 mb-3">
            <User className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-700">
              {payment.buyer.firstName} {payment.buyer.lastName}
            </span>
          </div>
        )}

        {/* Property Info */}
        {payment.unit && payment.project && (
          <div className="flex items-center space-x-2 mb-3">
            <Building className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-700">
              {payment.project.name} - Unit {payment.unit.unitNumber}
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            {expanded ? (
              <>
                Less details <ChevronUp className="w-4 h-4 ml-1" />
              </>
            ) : (
              <>
                More details <ChevronDown className="w-4 h-4 ml-1" />
              </>
            )}
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onView(payment)}
              className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-full transition-colors"
              title="View Payment"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors"
              title="Download Receipt"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="space-y-3">
            {payment.reference && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Reference</label>
                <p className="text-sm text-gray-900 font-mono">{payment.reference}</p>
              </div>
            )}

            {payment.description && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                <p className="text-sm text-gray-900">{payment.description}</p>
              </div>
            )}

            {payment.processedDate && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Processed Date</label>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-3 h-3 text-gray-400" />
                  <p className="text-sm text-gray-900">
                    {new Date(payment.processedDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            )}

            {payment.failureReason && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Failure Reason</label>
                <p className="text-sm text-red-700">{payment.failureReason}</p>
              </div>
            )}

            {payment.refundReason && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Refund Reason</label>
                <p className="text-sm text-gray-700">{payment.refundReason}</p>
              </div>
            )}

            {payment.gatewayResponse?.transactionId && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Gateway Transaction ID</label>
                <p className="text-sm text-gray-900 font-mono">{payment.gatewayResponse.transactionId}</p>
              </div>
            )}

            {payment.notes && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
                <p className="text-sm text-gray-900">{payment.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
