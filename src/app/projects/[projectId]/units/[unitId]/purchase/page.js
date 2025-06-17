      {/* Purchase Modal */}
      {showPurchaseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Purchase Unit {unit.unitNumber}</h3>
            <p className="text-gray-600 mb-6">
              You are about to purchase this unit for {formatPrice(unit.price)}.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => router.push(`/projects/${project.id}/units/${unit.id}/purchase`)}
                className="flex-1 btn-primary"
              >
                Continue to Purchase
              </button>
              <button
                onClick={() => setShowPurchaseModal(false)}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}