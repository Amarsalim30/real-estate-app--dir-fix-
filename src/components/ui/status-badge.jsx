import { 
  CheckCircle,
  Clock,
  AlertTriangle,
  X,
  FileText
} from 'lucide-react';
import { InvoiceStatuses } from '@/data/invoices';

const StatusBadge = ({ status }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case InvoiceStatuses.PAID:
        return {
          color: 'bg-green-100 text-green-800',
          icon: CheckCircle,
          label: 'Paid'
        };
      case InvoiceStatuses.PENDING:
        return {
          color: 'bg-yellow-100 text-yellow-800',
          icon: Clock,
          label: 'Pending'
        };
      case InvoiceStatuses.OVERDUE:
      case 'overdue':
        return {
          color: 'bg-red-100 text-red-800',
          icon: AlertTriangle,
          label: 'Overdue'
        };
      case InvoiceStatuses.CANCELLED:
        return {
          color: 'bg-gray-100 text-gray-800',
          icon: X,
          label: 'Cancelled'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800',
          icon: FileText,
          label: status
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
    </span>
  );
};

export default StatusBadge;
