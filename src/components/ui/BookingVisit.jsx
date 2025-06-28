import { useState } from 'react'
import { Modal,ModalBody, Button, Label, TextInput, Spinner } from 'flowbite-react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { Calendar, Phone, Clock, X, CheckCircle, AlertCircle } from 'lucide-react'

export default function BookVisitModal({ isOpen, onClose, onBooking }) {
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
    if (!/^2547\d{8}$/.test(phone)) {
      setError('Please enter a valid M-Pesa phone number (format: 2547XXXXXXXX)')
      return
    }

    setLoading(true)
    
    try {
      await onBooking({ date: datetime, time: datetime, phone })
      setSuccess(true)
      
      // Auto close after success
      setTimeout(() => {
        handleClose()
      }, 2000)
    } catch (e) {
      setError(e.message || 'Failed to book visit. Please try again.')
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
    if (value.length <= 12) {
      setPhone(value)
    }
  }

  // Get minimum date (tomorrow)
  const minDate = new Date()
  minDate.setDate(minDate.getDate() + 1)

  // Get maximum date (3 months from now)
  const maxDate = new Date()
  maxDate.setMonth(maxDate.getMonth() + 3)

  return (
    <Modal show={isOpen} onClose={handleClose} size="2xl" height="auto" className="booking-modal">
      {/* Custom Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Schedule a Visit</h3>
            <p className="text-sm text-gray-600">Book your property viewing appointment</p>
          </div>
        </div>
        <button
          onClick={handleClose}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          disabled={loading}
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <ModalBody className="p-6">
        {success ? (
          // Success State
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Visit Scheduled Successfully!</h4>
            <p className="text-gray-600 mb-4">
              Your visit has been booked for {datetime?.toLocaleDateString()} at {datetime?.toLocaleTimeString()}
            </p>
            <p className="text-sm text-gray-500">
              A confirmation will be sent to {phone}
            </p>
          </div>
        ) : (
          // Form State
          <div className="space-y-6">
            {/* Date and Time Selection */}
            <div>
              <Label htmlFor="datetime" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 mr-2 text-gray-500" />
                Select Date and Time
              </Label>
              <div className="relative">
                <DatePicker
                  id="datetime"
                  selected={datetime}
                  onChange={(date) => setDatetime(date)}
                  showTimeSelect
                  timeIntervals={30}
                  minDate={minDate}
                  maxDate={maxDate}
                  filterTime={(time) => {
                    const hour = time.getHours()
                    return hour >= 8 && hour <= 18 // Only allow 8 AM to 6 PM
                  }}
                  dateFormat="MMMM d, yyyy 'at' h:mm aa"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholderText="Choose your preferred date and time"
                  autoComplete="off"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Available: Tomorrow to 3 months ahead, 8:00 AM - 6:00 PM
              </p>
            </div>

            {/* Phone Number Input */}
            <div>
              <Label htmlFor="phone" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Phone className="w-4 h-4 mr-2 text-gray-500" />
                M-Pesa Phone Number
              </Label>
              <div className="relative">
                <TextInput
                  id="phone"
                  type="tel"
                  placeholder="2547XXXXXXXX"
                  value={phone}
                  onChange={handlePhoneChange}
                  className="pl-4 pr-4 py-3"
                  maxLength={12}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <span className="text-xs text-gray-400">
                    {phone.length}/12
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Enter your M-Pesa number for booking confirmation
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-start space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-800">Booking Error</p>
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              </div>
            )}

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle className="w-3 h-3 text-blue-600" />
                </div>
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">What to expect:</p>
                  <ul className="space-y-1 text-blue-700">
                    <li>• Professional property tour with our sales agent</li>
                    <li>• Detailed information about amenities and pricing</li>
                    <li>• Assistance with financing options</li>
                    <li>• No obligation to purchase</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </ModalBody>

      {/* Footer */}
      {!success && (
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-500">
            Free consultation • No hidden fees
          </div>
          <div className="flex space-x-3">
            <Button 
              color="gray" 
              onClick={handleClose} 
              disabled={loading}
              className="px-6 py-2"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={loading || !datetime || !phone}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
            >
              {loading ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Booking...
                </>
              ) : (
                <>
                  <Calendar className="w-4 h-4 mr-2" />
                  Book Visit
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Custom Styles */}
      <style jsx global>{`
        .booking-modal .react-datepicker-wrapper {
          width: 100%;
        }
        
        .booking-modal .react-datepicker__input-container input {
          width: 100% !important;
          padding: 12px 16px !important;
          border: 1px solid #d1d5db !important;
          border-radius: 8px !important;
          font-size: 14px !important;
          transition: all 0.2s ease !important;
        }
        
        .booking-modal .react-datepicker__input-container input:focus {
          outline: none !important;
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
        }
        
        .booking-modal .react-datepicker {
          border: 1px solid #e5e7eb !important;
          border-radius: 12px !important;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1) !important;
          font-family: inherit !important;
        }
        
        .booking-modal .react-datepicker__header {
          background-color: #f8fafc !important;
          border-bottom: 1px solid #e5e7eb !important;
          border-radius: 12px 12px 0 0 !important;
        }
        
        .booking-modal .react-datepicker__day--selected {
          background-color: #3b82f6 !important;
          color: white !important;
        }
        
        .booking-modal .react-datepicker__day:hover {
          background-color: #dbeafe !important;
          color: #1e40af !important;
        }
        
        .booking-modal .react-datepicker__time-list-item--selected {
          background-color: #3b82f6 !important;
          color: white !important;
        }
      `}</style>
    </Modal>
  )
}
