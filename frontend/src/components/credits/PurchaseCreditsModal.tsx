import React, { useState } from 'react';
import { X, CreditCard } from 'lucide-react';
import { CreditPackage } from '@/services/creditsApi';

interface PurchaseCreditsModalProps {
  packages: CreditPackage[];
  currentBalance: number;
  onClose: () => void;
  onPurchase: (packageId: string) => void;
}

const PurchaseCreditsModal: React.FC<PurchaseCreditsModalProps> = ({
  packages,
  currentBalance,
  onClose,
  onPurchase
}) => {
  const [selectedPackage, setSelectedPackage] = useState<string>('');

  const handlePurchase = () => {
    if (selectedPackage) {
      onPurchase(selectedPackage);
      onClose();
    }
  };

  const selectedPackageData = packages.find(p => p.id === selectedPackage);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <CreditCard size={20} />
              Purchase Credits
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <div className="text-sm text-gray-600 mb-4">
              Current balance: <span className="font-medium">{currentBalance.toLocaleString()} credits</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {packages.map(pkg => {
                const isSelected = selectedPackage === pkg.id;
                const totalCredits = pkg.credits + (pkg.bonus || 0);

                return (
                  <button
                    key={pkg.id}
                    onClick={() => setSelectedPackage(pkg.id)}
                    className={`text-left p-4 rounded-lg border-2 transition-all ${
                      isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    } ${pkg.isPopular ? 'ring-2 ring-blue-200' : ''}`}
                  >
                    {pkg.isPopular && (
                      <div className="text-xs font-medium text-blue-600 mb-1">Most Popular</div>
                    )}
                    <div className="font-medium text-gray-900">{pkg.name}</div>
                    <div className="text-2xl font-bold text-blue-600">${pkg.price}</div>
                    <div className="text-sm text-gray-600">
                      {pkg.credits.toLocaleString()} credits
                      {pkg.bonus && pkg.bonus > 0 && (
                        <span className="text-green-600 font-medium"> + {pkg.bonus} bonus</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Total: {totalCredits.toLocaleString()} credits
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {selectedPackageData && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="font-medium mb-2">Purchase Summary:</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Package:</span>
                  <span>{selectedPackageData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Credits:</span>
                  <span>{selectedPackageData.credits.toLocaleString()}</span>
                </div>
                {selectedPackageData.bonus && selectedPackageData.bonus > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Bonus credits:</span>
                    <span>+{selectedPackageData.bonus}</span>
                  </div>
                )}
                <div className="flex justify-between font-medium">
                  <span>Total credits:</span>
                  <span>{(selectedPackageData.credits + (selectedPackageData.bonus || 0)).toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-medium text-blue-600">
                  <span>Price:</span>
                  <span>${selectedPackageData.price}</span>
                </div>
                <hr />
                <div className="flex justify-between font-medium">
                  <span>New balance:</span>
                  <span>
                    {(currentBalance + selectedPackageData.credits + (selectedPackageData.bonus || 0)).toLocaleString()} credits
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handlePurchase}
            disabled={!selectedPackage}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            Purchase Credits
          </button>
        </div>
      </div>
    </div>
  );
};

export default PurchaseCreditsModal;