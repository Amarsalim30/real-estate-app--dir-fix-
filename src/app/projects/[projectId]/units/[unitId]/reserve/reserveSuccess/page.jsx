'use client';
import { useParams, useRouter } from 'next/navigation';
import { Projects } from '@/data/projects';
import { Units } from '@/data/units';
import { useSession } from 'next-auth/react';
import { formatPrice } from '@/utils/format';
import { 
  CheckCircle, 
  Calendar, 
  Clock, 
  Download, 
  Phone, 
  Mail, 
  Home,
  CreditCard,
  AlertTriangle,
  FileText
} from 'lucide-react';

export default function ReservationSuccessPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();

  const unit = Array.isArray(Units) ? Units.find(u => u.id === parseInt(params.unitId)) : null;
  const project = Array.isArray(Projects) ? Projects.find(p => p.id === parseInt(params.projectId)) : null;
  
  if (!unit || !project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Unit Not Found</h1>
          <button onClick={() => router.push('/projects')} className="btn-primary">
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  const confirmationNumber = `RES-${Date.now().toString().slice(-8)}`;
  const reservationDate = new Date().toLocaleDateString();
  const expirationDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString();
  const depositAmount = unit.price * 0.05; // 5% deposit
  const reservationFee = 500;

  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Unit Reserved Successfully!
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Unit {unit.unitNumber} is now reserved for you
          </p>
          <p className="text-gray-500">
            Reservation Number: <span className="font-mono font-semibold">{confirmationNumber}</span>
          </p>
        </div>

        {/* Reservation Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Reservation Summary */}
            <div className="bg-white rounded-xl shadow-sm border p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Reservation Summary</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Unit Information</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Unit:</span>
                      <span className="font-medium">Unit {unit.unitNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Project:</span>
                      <span className="font-medium">{project.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Location:</span>
                      <span className="font-medium">{project.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Size:</span>
                      <span className="font-medium">{unit.sqft?.toLocaleString()} sq ft</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Price:</span>
                      <span className="font-medium">{formatPrice(unit.price)}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Reservation Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Reserved On:</span>
                      <span className="font-medium">{reservationDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Expires On:</span>
                      <span className="font-medium text-orange-600">{expirationDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Deposit Paid:</span>
                      <span className="font-medium">{formatPrice(depositAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Reservation Fee:</span>
                      <span className="font-medium">{formatPrice(reservationFee)}</span>
                    </div>
                    <div className="border-t pt-3 flex justify-between">
                      <span className="font-semibold text-gray-900">Total Paid:</span>
                      <span className="text-xl font-bold text-gray-900">
                        {formatPrice(depositAmount + reservationFee)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Important Information */}
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
              <div className="flex items-start">
                <AlertTriangle className="w-6 h-6 text-orange-600 mt-0.5 mr-3" />
                <div>
                  <h3 className="font-semibold text-orange-900 mb-2">Important: Reservation Expires in 30 Days</h3>
                  <div className="text-sm text-orange-800 space-y-2">
                    <p>• Your reservation expires on <strong>{expirationDate}</strong></p>
                    <p>• To secure your unit, you must complete the purchase process before this date</p>
                    <p>• The deposit will be refunded if you decide not to proceed</p>
                    <p>• The reservation fee of {formatPrice(reservationFee)} is non-refundable</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-white rounded-xl shadow-sm border p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">What's Next?</h2>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-blue-600">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Confirmation Call (Within 24 hours)</h3>
                    <p className="text-gray-600">
                      Our sales team will call you to confirm your reservation and answer any questions you may have.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-blue-600">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Schedule Unit Viewing (Optional)</h3>
                    <p className="text-gray-600">
                      Visit the unit in person or take a virtual tour to finalize your decision. 
                      We can arrange a convenient time for you.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-blue-600">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Prepare for Purchase</h3>
                    <p className="text-gray-600">
                      Gather necessary documents for financing and prepare for the purchase process. 
                      We'll provide you with a complete checklist.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-green-600">4</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Complete Purchase</h3>
                    <p className="text-gray-600">
                      Proceed with the full purchase process before your reservation expires. 
                      Your deposit will be applied to the purchase price.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Countdown Timer */}
            <div className="bg-white rounded-xl shadow-sm border p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Reservation Countdown</h2>
              
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-32 h-32 bg-orange-100 rounded-full mb-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600">30</div>
                    <div className="text-sm text-orange-600">Days Left</div>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-4">
                  Your reservation expires on {expirationDate}
                </p>
                
                <button 
                  onClick={() => router.push(`/projects/${project.id}/units/${unit.id}/purchase`)}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Proceed to Purchase
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
                        {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              
              <div className="space-y-3">
                <button className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Download className="w-4 h-4 mr-2" />
                  Download Confirmation
                </button>
                
                <button 
                  onClick={() => router.push(`/projects/${project.id}/units/${unit.id}/purchase`)}
                  className="w-full flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Proceed to Purchase
                </button>
                
                <button className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Viewing
                </button>
                
                <button 
                  onClick={() => router.push('/dashboard')}
                  className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go to Dashboard
                </button>
              </div>
            </div>

            {/* Reservation Agent */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Reservation Agent</h3>
              
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <span className="text-xl font-bold text-gray-600">SM</span>
                </div>
                <div className="font-medium text-gray-900">Sarah Martinez</div>
                <div className="text-sm text-gray-600">Reservation Specialist</div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-700">+1-555-RESERVE</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-700">sarah.martinez@realestate.com</span>
                </div>
              </div>
              
              <button className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                Contact Agent
              </button>
            </div>

            {/* Reservation Status */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Reservation Status</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    <span className="text-sm font-medium text-green-800">Payment Received</span>
                  </div>
                  <span className="text-sm font-bold text-green-800">✓</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    <span className="text-sm font-medium text-green-800">Unit Reserved</span>
                  </div>
                  <span className="text-sm font-bold text-green-800">✓</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-blue-800">Confirmation Call</span>
                  </div>
                  <span className="text-sm font-bold text-blue-800">Pending</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 text-gray-600 mr-2" />
                    <span className="text-sm font-medium text-gray-800">Purchase Decision</span>
                  </div>
                  <span className="text-sm font-bold text-gray-800">30 Days</span>
                </div>
              </div>
            </div>

            {/* Unit Details Card */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Reserved Unit</h3>
              
              <div className="aspect-w-16 aspect-h-9 mb-4">
                <img
                  src={unit.images?.[0] || '/images/placeholder-unit.jpg'}
                  alt={`Unit ${unit.unitNumber}`}
                  className="w-full h-32 object-cover rounded-lg"
                  onError={(e) => {
                    e.target.src = '/images/placeholder-unit.jpg';
                  }}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Unit:</span>
                  <span className="font-medium">{unit.unitNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Floor:</span>
                  <span className="font-medium">{unit.floor}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Bedrooms:</span>
                  <span className="font-medium">{unit.bedrooms}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Bathrooms:</span>
                  <span className="font-medium">{unit.bathrooms}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Size:</span>
                  <span className="font-medium">{unit.sqft?.toLocaleString()} sq ft</span>
                </div>
              </div>
              
              <button 
                onClick={() => router.push(`/projects/${project.id}/units/${unit.id}`)}
                className="w-full mt-4 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                View Unit Details
              </button>
            </div>

            {/* Support */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
              
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-3">
                    Have questions about your reservation? We're here to help!
                  </p>
                  
                  <div className="space-y-2">
                    <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                      <Phone className="w-4 h-4 mr-2" />
                      Call Support
                    </button>
                    
                    <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                      <Mail className="w-4 h-4 mr-2" />
                      Email Support
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600 text-center">
                  Support Hours: Monday-Friday, 9 AM - 6 PM EST
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Reservation FAQ</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">What happens if I don't purchase within 30 days?</h3>
                <p className="text-gray-600 text-sm">
                  Your reservation will expire and the unit will become available to other buyers. Your deposit will be refunded, but the reservation fee is non-refundable.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Can I extend my reservation period?</h3>
                <p className="text-gray-600 text-sm">
                  Extensions may be possible depending on demand and availability. Contact your reservation agent to discuss options and any additional fees.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Is my deposit refundable?</h3>
                <p className="text-gray-600 text-sm">
                  Yes, your deposit is fully refundable if you decide not to proceed with the purchase within the reservation period. Only the reservation fee is non-refundable.
                </p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Can I visit the unit during the reservation period?</h3>
                <p className="text-gray-600 text-sm">
                  Absolutely! We encourage you to visit the unit or take a virtual tour. Contact your agent to schedule a convenient viewing time.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">What documents do I need for the purchase?</h3>
                <p className="text-gray-600 text-sm">
                  You'll need proof of income, bank statements, credit report, and employment verification. We'll provide a complete checklist when you're ready to proceed.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibent text-gray-900 mb-2">Can someone else purchase the unit on my behalf?</h3>
                <p className="text-gray-600 text-sm">
                  Yes, but proper legal documentation and authorization will be required. Please discuss this with your agent to ensure all requirements are met.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
