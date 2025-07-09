import { useState } from 'react';
import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { 
  Calendar, 
  Phone, 
  Clock, 
  X, 
  CheckCircle, 
  AlertCircle, 
  MapPin,
  User,
  Star,
  Shield,
  Headphones
} from 'lucide-react'

export default function BookVisitModal({ isOpen, onClose, onBooking, projectName }) {
  const [datetime, setDatetime] = useState(null)
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async () => {
    // Reset states
    setError('')
    setSuccess(false)

    // Validation
    if (!datetime) {
      setError('Please select a date and time for your visit.')
      return
    }

    // Check if selected date is in the future
    if (datetime <= new Date()) {
      setError('Please select a future date and time.')
      return
    }

    // Phone validation for Kenyan format
    if (!/^2547\d{9}$/.test(phone)) {
      setError('Please enter a valid M-Pesa phone number (format: 2547XXXXXXXX)')
      return
    }

    setLoading(true)
    
    try {
      await onBooking({ datetime, phone, projectName })
      setSuccess(true)
      
      // Auto close after success
      setTimeout(() => {
        handleClose()
      }, 3000)
    } catch (e) {
      setError(e.message || 'Failed to book visit. Please try again.')
            // Auto close after success
      setTimeout(() => {
        handleClose()
      }, 3000)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setDatetime(null)
    setPhone('')
    setError('')
    setSuccess(false)
    setLoading(false)
    onClose()
  }

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, '') // Remove non-digits
    if (value.length <= 13) {
      setPhone(value)
    }
  }
  const CustomLockedInput = React.forwardRef(({ value, onClick }, ref) => (
  <div
    onClick={onClick}
    ref={ref}
    className="text-gray-500 w-full px-3 sm:px-4 py-3 sm:py-4 border border-gray-300 rounded-lg cursor-pointer select-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all text-sm sm:text-base"
    tabIndex={0}
  >
    {value || 'Select date and time'}
  </div>
));

  // Get minimum date (tomorrow)
  const minDate = new Date()
  minDate.setDate(minDate.getDate() + 1)

  // Get maximum date (3 months from now)
  const maxDate = new Date()
  maxDate.setMonth(maxDate.getMonth() + 3)

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0  bg-opacity-50 z-40 backdrop-blur-sm transition-opacity duration-300" onClick={handleClose} />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-slate-700" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                  Schedule Property Visit
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  {projectName ? `Book your visit to ${projectName}` : 'Book your personalized viewing appointment'}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={loading}
              className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
            </button>
          </div>

          {/* Body */}
          <div className="max-h-[60vh] overflow-y-auto">
            {success ? (
              // Success State
              <div className="text-center py-8 sm:py-12 px-4 sm:px-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-600" />
                </div>
                <h4 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">
                  Visit Scheduled Successfully
                </h4>
                <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                  <p className="text-sm sm:text-base text-gray-600">
                    Your appointment has been confirmed for
                  </p>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 sm:p-4 inline-block">
                    <div className="flex items-center space-x-2 text-slate-800">
                      <Calendar className="w-4 h-4" />
                      <span className="font-medium text-sm sm:text-base">
                        {datetime?.toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-slate-800 mt-1">
                      <Clock className="w-4 h-4" />
                      <span className="font-medium text-sm sm:text-base">
                        {datetime?.toLocaleTimeString('en-US', { 
                          hour: 'numeric', 
                          minute: '2-digit',
                          hour12: true 
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-gray-500 mb-4">
                  Confirmation sent to <span className="font-medium">+{phone}</span>
                </p>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 sm:p-4 text-left">
                  <h5 className="font-medium text-slate-900 text-sm mb-2">What's Next?</h5>
                  <ul className="text-xs sm:text-sm text-slate-700 space-y-1">
                    <li>• SMS confirmation will be sent shortly</li>
                    <li>• Our agent will contact you 24 hours before</li>
                    <li>• Please bring valid ID for property access</li>
                  </ul>
                </div>
              </div>
            ) : (
              // Form State
              <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
                {/* Progress Indicator */}
                <div className="flex items-center justify-center space-x-2 sm:space-x-4">
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-colors ${
                      datetime ? 'bg-slate-700' : 'bg-gray-300'
                    }`}></div>
                    <span className="text-xs sm:text-sm text-gray-600">Date & Time</span>
                  </div>
                  <div className="w-4 sm:w-8 h-0.5 bg-gray-200"></div>
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-colors ${
                      phone ? 'bg-slate-700' : 'bg-gray-300'
                    }`}></div>
                    <span className="text-xs sm:text-sm text-gray-600">Contact</span>
                  </div>
                  <div className="w-4 sm:w-8 h-0.5 bg-gray-200"></div>
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-colors ${
                      datetime && phone ? 'bg-emerald-600' : 'bg-gray-300'
                    }`}></div>
                    <span className="text-xs sm:text-sm text-gray-600">Confirm</span>
                  </div>
                </div>

                {/* Date and Time Selection */}
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-slate-700" />
                    </div>
                    <div>
                      <label className="text-sm sm:text-base font-medium text-gray-900">
                        Select Date & Time
                      </label>
                      <p className="text-xs sm:text-sm text-gray-500">
                        Choose your preferred appointment slot
                      </p>
                    </div>
                  </div>
                  
                  <div className="relative">
   <DatePicker
  selected={datetime}
  onChange={(date) => setDatetime(date)}
  showTimeSelect
  timeIntervals={30}
  minDate={minDate}
  maxDate={maxDate}
  filterTime={(time) => {
    const hour = time.getHours();
    return hour >= 8 && hour <= 18;
  }}
  dateFormat="EEEE, MMMM d, yyyy 'at' h:mm aa"
  autoComplete="off"
  popperClassName="booking-datepicker-popper"
  customInput={<CustomLockedInput />}
/>
                  </div>
                  
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 sm:p-4">
                    <div className="flex items-start space-x-2 sm:space-x-3">
                      <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600 mt-0.5 flex-shrink-0" />
                      <div className="text-xs sm:text-sm text-slate-700">
                        <p className="font-medium mb-1">Available Hours</p>
                        <p>Monday - Sunday: 8:00 AM - 6:00 PM</p>
                        <p className="mt-1 text-slate-600">Advance booking up to 3 months</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Phone Number Input */}
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                      <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-slate-700" />
                    </div>
                    <div>
                      <label className="text-sm sm:text-base font-medium text-gray-900">
                        Contact Number
                      </label>
                      <p className="text-xs sm:text-sm text-gray-500">
                        For appointment confirmation
                      </p>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                      <span className="text-gray-500 text-sm sm:text-base">+</span>
                    </div>
                    <input
                      type="tel"
                      placeholder="2547XXXXXXXX"
                      value={phone}
                      onChange={handlePhoneChange}
                      className="text-gray-500 placeholder-gray-500 w-full pl-8 sm:pl-10 pr-12 sm:pr-16 py-3 sm:py-4 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all"
                      maxLength={13}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center pointer-events-none">
                      <span className="text-xs sm:text-sm text-gray-400">
                        {phone.length}/13
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 sm:p-4">
                    <div className="flex items-start space-x-2 sm:space-x-3">
                      <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600 mt-0.5 flex-shrink-0" />
                      <div className="text-xs sm:text-sm text-slate-700">
                        <p className="font-medium mb-1">Privacy Protected</p>
                        <p>Your contact information is secure and will only be used for appointment coordination.</p>
                      </div>
                    </div>
                  </div>
                </div>

                              {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
                    <div className="flex items-start space-x-2 sm:space-x-3">
                      <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-red-800">Unable to Book</p>
                        <p className="text-sm text-red-700 mt-1">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* What to Expect Section */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 sm:p-6">
                  <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-slate-700" />
                    </div>
                    <h4 className="text-sm sm:text-base font-semibold text-slate-900">
                      What's Included in Your Visit
                    </h4>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="flex items-start space-x-2 sm:space-x-3">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-white rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                        <User className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-slate-600" />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-slate-900">Professional Guide</p>
                        <p className="text-xs text-slate-600">Experienced sales consultant</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-2 sm:space-x-3">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-white rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                        <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-slate-600" />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-slate-900">Complete Tour</p>
                        <p className="text-xs text-slate-600">All units and amenities</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-2 sm:space-x-3">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-white rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                        <Headphones className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-slate-600" />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-slate-900">Financing Options</p>
                        <p className="text-xs text-slate-600">Payment plans available</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-2 sm:space-x-3">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-white rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                        <Shield className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-slate-600" />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-slate-900">No Pressure</p>
                        <p className="text-xs text-slate-600">Free consultation only</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-200">
                    <div className="flex items-center justify-center space-x-2 text-xs text-slate-600">
                      <Clock className="w-3 h-3" />
                      <span>Typical duration: 45-60 minutes</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          {!success && (
            <div className="border-t border-gray-200 bg-gray-50 px-4 sm:px-6 py-4 sm:py-6">
              <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0 sm:space-x-4">
                <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600">
                  <Shield className="w-4 h-4 text-slate-600" />
                  <span>Secure • Free Consultation • No Obligations</span>
                </div>
                
                <div className="flex w-full sm:w-auto space-x-3">
                  <button 
                    onClick={handleClose} 
                    disabled={loading}
                    className="flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
                  >
                    Cancel
                  </button>
                  
                  <button 
                    onClick={handleSubmit} 
                    disabled={loading || !datetime || !phone}
                    className="flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium bg-slate-800 hover:bg-slate-900 text-white disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors rounded-lg"
                  >
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Booking...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>Schedule Visit</span>
                      </div>
                    )}
                  </button>
                </div>
              </div>
              
              {/* Trust Indicators */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="w-3 h-3 text-emerald-600" />
                    <span>Instant Confirmation</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Shield className="w-3 h-3 text-slate-600" />
                    <span>Secure Platform</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-3 h-3 text-amber-500" />
                    <span>Professional Service</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx global>{`
        .booking-datepicker-popper {
          z-index: 9999 !important;
        }
        
        .react-datepicker-wrapper {
          width: 100%;
        }
        
        .react-datepicker__input-container input {
          width: 100% !important;
        }
        
        .react-datepicker {
          border: 1px solid #e5e7eb !important;
          border-radius: 12px !important;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
          font-family: inherit !important;
          overflow: hidden !important;
        }
        
        .react-datepicker__header {
          background-color: #f8fafc !important;
          border-bottom: 1px solid #e5e7eb !important;
          border-radius: 11px 11px 0 0 !important;
          padding: 16px !important;
        }
        
        .react-datepicker__current-month {
          font-weight: 600 !important;
          font-size: 16px !important;
          color: #1f2937 !important;
        }
        
        .react-datepicker__day-name {
          color: #6b7280 !important;
          font-weight: 500 !important;
          font-size: 12px !important;
        }
        
        .react-datepicker__day {
          border-radius: 6px !important;
          margin: 2px !important;
          font-weight: 400 !important;
          transition: all 0.2s ease !important;
        }
        
        .react-datepicker__day--selected {
          background-color: #1e293b !important;
          color: white !important;
          font-weight: 500 !important;
        }
        
        .react-datepicker__day:hover {
          background-color: #f1f5f9 !important;
          color: #334155 !important;
        }
        
        .react-datepicker__day--disabled {
          color: #d1d5db !important;
          background-color: transparent !important;
        }
        
        .react-datepicker__time-container {
          border-left: 1px solid #e5e7eb !important;
        }
        
        .react-datepicker__time-list {
          scrollbar-width: thin !important;
          scrollbar-color: #cbd5e1 #f1f5f9 !important;
        }
        
        .react-datepicker__time-list::-webkit-scrollbar {
          width: 6px !important;
        }
        
        .react-datepicker__time-list::-webkit-scrollbar-track {
          background: #f1f5f9 !important;
        }
        
        .react-datepicker__time-list::-webkit-scrollbar-thumb {
          background: #cbd5e1 !important;
          border-radius: 3px !important;
        }
        
        .react-datepicker__time-list-item {
          padding: 8px 16px !important;
          font-weight: 400 !important;
          transition: all 0.2s ease !important;
        }
        
        .react-datepicker__time-list-item--selected {
          background-color: #1e293b !important;
          color: white !important;
          font-weight: 500 !important;
        }
        
        .react-datepicker__time-list-item:hover {
          background-color: #f1f5f9 !important;
          color: #334155 !important;
        }
        
        @media (max-width: 640px) {
          .react-datepicker {
            font-size: 14px !important;
          }
          
          .react-datepicker__header {
            padding: 12px !important;
          }
          
          .react-datepicker__current-month {
            font-size: 14px !important;
          }
          
          .react-datepicker__day-name {
            font-size: 11px !important;
          }
          
          .react-datepicker__day {
            margin: 1px !important;
            width: 28px !important;
            height: 28px !important;
            line-height: 28px !important;
          }
          
          .react-datepicker__time-list-item {
            padding: 6px 12px !important;
            font-size: 13px !important;
          }
        }
      `}</style>
    </>
  )
}
