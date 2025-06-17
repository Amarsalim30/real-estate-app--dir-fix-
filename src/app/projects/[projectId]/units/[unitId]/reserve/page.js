      {/* Reserve Modal */}
      {showReserveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reserve Unit {unit.unitNumber}</h3>
            <p className="text-gray-600 mb-6">
              You are about to reserve this unit. A reservation typically requires a deposit.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => router.push(`/projects/${project.id}/units/${unit.id}/reserve`)}
                className="flex-1 btn-primary"
              >
                Continue to Reserve
              </button>
              <button
                onClick={() => setShowReserveModal(false)}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}