'use client';
import { useParams, useRouter } from 'next/navigation';

// import { Projects } from '@/data/projects';
// import { Units } from '@/data/units';

import { useProjects } from '@/hooks/useProjects';
import { useUnits } from '@/hooks/useUnits';

import { useSession } from 'next-auth/react';
import Header from '@/components/layout/header';
import { formatPrice } from '@/utils/format';
import { 
  CheckCircle, 
  Download, 
  Calendar, 
  Phone, 
  Mail, 
  ArrowLeft,
  Home,
  FileText,
  CreditCard,
  Clock
} from 'lucide-react';

export default function PurchaseSuccessPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const {projects:Projects} =useProjects();
  const {units:Units} =useUnits();

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
    const confirmationNumber = `PUR-${Date.now().toString().slice(-8)}`;
  const purchaseDate = new Date().toLocaleDateString();
  const estimatedClosingDate = new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toLocaleDateString();

  return (
    <div className="min-h-screen bg-gray-50">
      <button
            onClick={() => router.push(`/dashboard`)}
            className="flex items-center p-1.5 text-gray-500 hover:text-gray-700 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span className="text-sm sm:text-base">Back to Dashboard</span>
          </button>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Purchase Submitted Successfully!
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Your purchase request for Unit {unit.unitNumber} has been received
          </p>
          <p className="text-gray-500">
            Confirmation Number: <span className="font-mono font-semibold">{confirmationNumber}</span>
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Purchase Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Purchase Summary */}
            <div className="bg-white rounded-xl shadow-sm border p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Purchase Summary</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Unit Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Unit:</span>
                      <span className="font-medium text-gray-700">Unit {unit.unitNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Project:</span>
                      <span className="font-medium text-gray-700">{project.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Location:</span>
                      <span className="font-medium text-gray-700">{project.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Size:</span>
                      <span className="font-medium text-gray-700">{unit.sqft?.toLocaleString()} sq ft</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Bedrooms:</span>
                      <span className="font-medium text-gray-700">{unit.bedrooms}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Bathrooms:</span>
                      <span className="font-medium text-gray-700">{unit.bathrooms}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Purchase Information</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Purchase Price:</span>
                      <span className="font-medium text-gray-700">{formatPrice(unit.price)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Est. Taxes & Fees:</span>
                      <span className="font-medium text-gray-700">{formatPrice(unit.price * 0.08)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Processing Fee:</span>
                      <span className="font-medium text-gray-700">$500</span>
                    </div>
                    <div className="border-t pt-3 flex justify-between">
                      <span className="font-semibold text-gray-900">Total Amount:</span>
                      <span className="text-xl font-bold text-gray-900">
                        {formatPrice(unit.price * 1.08 + 500)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Purchase Date:</span>
                      <span className="font-medium text-gray-700">{purchaseDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Est. Closing:</span>
                      <span className="font-medium text-gray-700">{estimatedClosingDate}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-white rounded-xl shadow-sm border p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">What Happens Next?</h2>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-blue-600">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Document Review (1-2 business days)</h3>
                    <p className="text-gray-600">
                      Our team will review your purchase application and supporting documents. 
                      You'll receive an email confirmation once approved.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-blue-600">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Contract Preparation (3-5 business days)</h3>
                    <p className="text-gray-600">
                      We'll prepare your purchase contract and schedule a meeting to review 
                      all terms and conditions with you.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-blue-600">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Financing & Inspection (2-3 weeks)</h3>
                    <p className="text-gray-600">
                      Complete your financing arrangements and schedule property inspection. 
                      Our team will assist you throughout this process.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-green-600">4</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Closing (4-6 weeks)</h3>
                    <p className="text-gray-600">
                      Final walkthrough, document signing, and key handover. 
                      Congratulations on your new home!
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Important Information */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
              <div className="flex items-start">
                <Clock className="w-6 h-6 text-amber-600 mt-0.5 mr-3" />
                <div>
                  <h3 className="font-semibold text-amber-900 mb-2">Important Reminders</h3>
                  <div className="text-sm text-amber-800 space-y-1">
                    <p>• Keep your confirmation number safe for all future communications</p>
                    <p>• Check your email regularly for updates and document requests</p>
                    <p>• Our team will contact you within 24 hours to schedule your next meeting</p>
                    <p>• Have your financing pre-approval ready for faster processing</p>
                  </div>
                </div>
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
                  Download Receipt
                </button>
                
                <button className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  <FileText className="w-4 h-4 mr-2" />
                  View Purchase Agreement
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

            {/* Contact Information */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Purchase Specialist</h3>
              
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <span className="text-xl font-bold text-gray-600">JS</span>
                </div>
                <div className="font-medium text-gray-900">John Smith</div>
                <div className="text-sm text-gray-600">Senior Sales Manager</div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-700">+1-555-PURCHASE</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-700">john.smith@realestate.com</span>
                </div>
              </div>
              
              <button className="w-full mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
                Schedule Meeting
              </button>
            </div>

            {/* Payment Information */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Schedule</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    <span className="text-sm font-medium text-green-800">Application Fee</span>
                  </div>
                  <span className="text-sm font-bold text-green-800">Paid</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-blue-800">Down Payment</span>
                  </div>
                  <span className="text-sm font-bold text-blue-800">Pending</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 text-gray-600 mr-2" />
                    <span className="text-sm font-medium text-gray-800">Final Payment</span>
                  </div>
                  <span className="text-sm font-bold text-gray-800">At Closing</span>
                </div>
              </div>
            </div>

            {/* Support */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
              
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-3">
                    Our support team is here to help you through every step of the process.
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

        {/* Additional Information */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">When will I receive my contract?</h3>
                <p className="text-gray-600 text-sm">
                  Your purchase contract will be prepared within 3-5 business days. We'll schedule a meeting to review all terms before signing.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">What documents do I need for financing?</h3>
                <p className="text-gray-600 text-sm">
                  You'll need proof of income, bank statements, credit report, and employment verification. Our team will provide a complete checklist.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Can I make changes to my unit?</h3>
                <p className="text-gray-600 text-sm">
                  Depending on the construction phase, some customizations may be available. We'll discuss options during your contract meeting.
                </p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">What happens if I need to cancel?</h3>
                <p className="text-gray-600 text-sm">
                  You have a cooling-off period as specified in your contract. Terms and conditions will be clearly explained during contract review.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">When can I move in?</h3>
                <p className="text-gray-600 text-sm">
                  Move-in date depends on construction progress and closing completion. Current estimated completion is {project.expectedCompletion?.toLocaleDateString()}.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Is there a warranty on my unit?</h3>
                <p className="text-gray-600 text-sm">
                  Yes, all units come with a comprehensive warranty covering structural and mechanical systems. Details will be provided in your contract.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

