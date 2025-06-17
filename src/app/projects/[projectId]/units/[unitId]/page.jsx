'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Projects } from '@/data/projects';
import { Units } from '@/data/units';
import { Buyers } from '@/data/buyers';
import { useSession } from 'next-auth/react';
import { Navbar } from '@/components/layout/navbar';
import { formatPrice } from '@/utils/format';
import { 
  ArrowLeft, 
  Building, 
  MapPin, 
  Bed, 
  Bath, 
  Square,
  Calendar,
  User,
  Phone,
  Mail,
  Heart,
  Share2,
  CheckCircle,
  AlertCircle,
  Clock,
  Eye,
  Download,
  Calculator
} from 'lucide-react';

export default function UnitDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showCalculator, setShowCalculator] = useState(false);

  const unit = Units.find(u => u.id === parseInt(params.unitId));
  const project = Projects.find(p => p.id === parseInt(params.projectId));
  
  if (!unit || !project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Unit Not Found</h1>
          <button 
            onClick={() => router.push('/projects')} 
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'available':
        return CheckCircle;
      case 'reserved':
        return Clock;
      case 'sold':
        return AlertCircle;
      default:
        return Building;
    }
  };

  const StatusIcon = getStatusIcon(unit.status);

  // Get buyer info if unit is sold or reserved
  const buyer = unit.soldTo ? Buyers.find(b => b.id === unit.soldTo) : 
                unit.reservedBy ? Buyers.find(b => b.id === unit.reservedBy) : null;

  const handleReserve = () => {
    if (!session?.user) {
      router.push('/login');
      return;
    }
    router.push(`/projects/${project.id}/units/${unit.id}/reserve`);
  };

  const handlePurchase = () => {
    if (!session?.user) {
      router.push('/login');
      return;
    }
    router.push(`/projects/${project.id}/units/${unit.id}/purchase`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <button
            onClick={() => router.push('/projects')}
            className="hover:text-gray-900 transition-colors"
          >
            Projects
          </button>
          <span>/</span>
          <button
            onClick={() => router.push(`/projects/${project.id}`)}
            className="hover:text-gray-900 transition-colors"
          >
            {project.name}
          </button>
          <span>/</span>
          <span className="text-gray-900 font-medium">Unit {unit.unitNumber}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="relative h-96">
                {unit.images && unit.images.length > 0 ? (
                  <img
                    src={unit.images[activeImageIndex]}
                    alt={`Unit ${unit.unitNumber}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <Building className="w-24 h-24 text-gray-400" />
                </div>
                
                {/* Status Badge */}
                <div className="absolute top-4 left-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(unit.status)}`}>
                    <StatusIcon className="w-4 h-4 mr-2" />
                    {unit.status.charAt(0).toUpperCase() + unit.status.slice(1)}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="absolute top-4 right-4 flex space-x-2">
                  <button className="p-2 bg-white/80 backdrop-blur-sm rounded-full text-gray-700 hover:bg-white transition-colors">
                    <Heart className="w-5 h-5" />
                  </button>
                  <button className="p-2 bg-white/80 backdrop-blur-sm rounded-full text-gray-700 hover:bg-white transition-colors">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Thumbnail Gallery */}
              {unit.images && unit.images.length > 1 && (
                <div className="p-4 border-t">
                  <div className="flex space-x-2 overflow-x-auto">
                    {unit.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveImageIndex(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                          activeImageIndex === index ? 'border-blue-500' : 'border-gray-200'
                        }`}
                      >
                        <img
                          src={image}
                          alt={`Unit ${unit.unitNumber} - ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
                        {/* Unit Details */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Unit {unit.unitNumber}
                  </h1>
                  <div className="flex items-center text-gray-600 mb-4">
                    <MapPin className="w-5 h-5 mr-2" />
                    {project.name}, {project.location}
                  </div>
                  <p className="text-gray-600 text-lg">{unit.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {formatPrice(unit.price)}
                  </div>
                  <div className="text-gray-600">
                    {formatPrice(Math.round(unit.price / unit.sqft))}/sq ft
                  </div>
                </div>
              </div>

              {/* Unit Specifications */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Bed className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{unit.bedrooms}</div>
                  <div className="text-sm text-gray-600">Bedrooms</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Bath className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{unit.bathrooms}</div>
                  <div className="text-sm text-gray-600">Bathrooms</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Square className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{unit.sqft}</div>
                  <div className="text-sm text-gray-600">Sq Ft</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Building className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{unit.floor}</div>
                  <div className="text-sm text-gray-600">Floor</div>
                </div>
              </div>

              {/* Features */}
              {unit.features && unit.features.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Features & Amenities</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {unit.features.map((feature, index) => (
                      <div key={index} className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Buyer Information (if sold/reserved) */}
              {buyer && (
                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {unit.status === 'sold' ? 'Sold To' : 'Reserved By'}
                  </h3>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {buyer.firstName} {buyer.lastName}
                      </div>
                      <div className="text-sm text-gray-600">
                        {unit.status === 'sold' ? 'Purchase Date' : 'Reservation Date'}: {' '}
                        {new Date(unit.status === 'sold' ? unit.soldDate : unit.reservedDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Floor Plan */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Floor Plan</h3>
              <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
                <div className="text-center">
                  <Eye className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Floor Plan</h4>
                  <p className="text-gray-600">Interactive floor plan coming soon</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Action Card */}
            <div className="bg-white rounded-xl shadow-sm border p-6 sticky top-6">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {formatPrice(unit.price)}
                </div>
                <div className="text-gray-600">
                  {formatPrice(Math.round(unit.price / unit.sqft))}/sq ft
                </div>
              </div>

              {unit.status === 'available' && (
                <div className="space-y-3">
                  <button
                    onClick={handlePurchase}
                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Purchase Now
                  </button>
                  <button
                    onClick={handleReserve}
                    className="w-full px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                  >
                    Reserve Unit
                  </button>
                  <button
                    onClick={() => setShowCalculator(!showCalculator)}
                    className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center"
                  >
                    <Calculator className="w-5 h-5 mr-2" />
                    Mortgage Calculator
                  </button>
                </div>
              )}

              {unit.status === 'reserved' && (
                <div className="text-center">
                  <div className="inline-flex items-center px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium mb-4">
                    <Clock className="w-4 h-4 mr-2" />
                    Reserved
                  </div>
                  <p className="text-gray-600 text-sm">
                    This unit is currently reserved. Contact us to be notified if it becomes available.
                  </p>
                </div>
              )}

              {unit.status === 'sold' && (
                <div className="text-center">
                  <div className="inline-flex items-center px-4 py-2 bg-red-100 text-red-800 rounded-full text-sm font-medium mb-4">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Sold
                  </div>
                  <p className="text-gray-600 text-sm">
                    This unit has been sold. Browse other available units in this project.
                  </p>
                </div>
              )}

              <div className="border-t pt-6 mt-6">
                <button className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center mb-3">
                  <Download className="w-5 h-5 mr-2" />
                  Download Brochure
                </button>
                <button className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors">
                  Schedule Viewing
                </button>
              </div>
            </div>

            {/* Mortgage Calculator */}
            {showCalculator && (
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Mortgage Calculator</h3>
                <MortgageCalculator unitPrice={unit.price} />
              </div>
            )}

            {/* Contact Information */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Sales Team</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Phone className="w-5 h-5 text-blue-600 mr-3" />
                  <div>
                    <div className="font-medium text-gray-900">Sales Office</div>
                    <div className="text-gray-600">+1 (555) 123-4567</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <Mail className="w-5 h-5 text-blue-600 mr-3" />
                  <div>
                    <div className="font-medium text-gray-900">Email</div>
                    <div className="text-gray-600">sales@example.com</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Project Info */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">About {project.name}</h3>
              <p className="text-gray-600 text-sm mb-4">{project.description}</p>
              <button
                onClick={() => router.push(`/projects/${project.id}`)}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                View Project Details →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Mortgage Calculator Component
const MortgageCalculator = ({ unitPrice }) => {
  const [loanAmount, setLoanAmount] = useState(unitPrice * 0.8); // 80% LTV
  const [interestRate, setInterestRate] = useState(6.5);
  const [loanTerm, setLoanTerm] = useState(30);
  const [downPayment, setDownPayment] = useState(unitPrice * 0.2);

  const calculateMonthlyPayment = () => {
    const principal = loanAmount;
    const monthlyRate = interestRate / 100 / 12;
    const numberOfPayments = loanTerm * 12;
    
    if (monthlyRate === 0) {
      return principal / numberOfPayments;
    }
    
    const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
                          (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    
    return monthlyPayment;
  };

  const monthlyPayment = calculateMonthlyPayment();

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Home Price
        </label>
        <input
          type="text"
          value={formatPrice(unitPrice)}
          disabled
          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Down Payment
        </label>
        <input
          type="number"
          value={downPayment}
          onChange={(e) => {
            const dp = parseFloat(e.target.value) || 0;
            setDownPayment(dp);
            setLoanAmount(unitPrice - dp);
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Interest Rate (%)
        </label>
        <input
          type="number"
          step="0.1"
          value={interestRate}
          onChange={(e) => setInterestRate(parseFloat(e.target.value) || 0)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Loan Term (years)
        </label>
        <select
          value={loanTerm}
          onChange={(e) => setLoanTerm(parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value={15}>15 years</option>
          <option value={20}>20 years</option>
          <option value={25}>25 years</option>
          <option value={30}>30 years</option>
        </select>
      </div>

      <div className="border-t pt-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">Monthly Payment:</span>
          <span className="text-lg font-bold text-gray-900">
            {formatPrice(monthlyPayment)}
          </span>
        </div>
        <div className="flex justify-between items-center text-sm text-gray-600">
                    <span>Total Interest:</span>
          <span>{formatPrice((monthlyPayment * loanTerm * 12) - loanAmount)}</span>
        </div>
      </div>
    </div>
  );
};

