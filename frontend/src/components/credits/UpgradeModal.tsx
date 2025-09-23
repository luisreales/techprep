import React, { useState } from 'react';
import { X, Star } from 'lucide-react';
import { SubscriptionTier, UserSubscription } from '@/services/creditsApi';

interface UpgradeModalProps {
  tiers: SubscriptionTier[];
  currentSubscription: UserSubscription | null;
  onClose: () => void;
  onUpgrade: (tierId: string, billingCycle: 'monthly' | 'yearly') => void;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({
  tiers,
  currentSubscription,
  onClose,
  onUpgrade
}) => {
  const [selectedTier, setSelectedTier] = useState<string>('');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const handleUpgrade = () => {
    if (selectedTier) {
      onUpgrade(selectedTier, billingCycle);
      onClose();
    }
  };

  const selectedTierData = tiers.find(t => t.id === selectedTier);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Upgrade Your Plan</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <div className="flex items-center justify-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="billing"
                  value="monthly"
                  checked={billingCycle === 'monthly'}
                  onChange={(e) => setBillingCycle(e.target.value as any)}
                  className="w-4 h-4 text-blue-600"
                />
                <span>Monthly billing</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="billing"
                  value="yearly"
                  checked={billingCycle === 'yearly'}
                  onChange={(e) => setBillingCycle(e.target.value as any)}
                  className="w-4 h-4 text-blue-600"
                />
                <span>Yearly billing (Save up to 20%)</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {tiers.filter(t => t.type !== 'free').map(tier => {
              const price = billingCycle === 'yearly' ? tier.pricing.yearly : tier.pricing.monthly;
              const isSelected = selectedTier === tier.id;
              const isCurrent = currentSubscription?.tierId === tier.id;

              return (
                <button
                  key={tier.id}
                  onClick={() => setSelectedTier(tier.id)}
                  className={`text-left p-4 rounded-lg border-2 transition-all ${
                    isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  } ${isCurrent ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={isCurrent}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{tier.name}</h3>
                    {tier.isPopular && <Star size={16} className="text-yellow-500" />}
                    {isCurrent && <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Current</span>}
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    ${price}
                    <span className="text-sm text-gray-500">/{billingCycle === 'yearly' ? 'year' : 'month'}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{tier.description}</p>
                </button>
              );
            })}
          </div>

          {selectedTierData && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="font-medium mb-2">What you'll get with {selectedTierData.name}:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• {selectedTierData.limits.monthlyCredits.toLocaleString()} credits per month</li>
                {selectedTierData.features.slice(0, 3).map((feature, index) => (
                  <li key={index}>• {feature.name}</li>
                ))}
                {selectedTierData.features.length > 3 && (
                  <li>• +{selectedTierData.features.length - 3} more features</li>
                )}
              </ul>
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
            onClick={handleUpgrade}
            disabled={!selectedTier}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            Upgrade Plan
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;