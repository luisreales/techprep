import React from 'react';
import { CreditCard, Gift, Star } from 'lucide-react';
import { CreditPackage } from '@/services/creditsApi';

interface CreditPackageCardProps {
  package: CreditPackage;
  onPurchase: () => void;
}

const CreditPackageCard: React.FC<CreditPackageCardProps> = ({
  package: pkg,
  onPurchase
}) => {
  const pricePerCredit = pkg.price / pkg.credits;
  const totalCredits = pkg.credits + (pkg.bonus || 0);

  return (
    <div className={`bg-white rounded-lg border-2 p-6 hover:shadow-lg transition-shadow ${
      pkg.isPopular ? 'border-blue-500 relative' : 'border-gray-200'
    }`}>
      {pkg.isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
            <Star size={14} />
            Best Value
          </span>
        </div>
      )}

      <div className="text-center mb-4">
        <CreditCard size={32} className="mx-auto text-blue-600 mb-2" />
        <h3 className="text-xl font-bold text-gray-900">{pkg.name}</h3>
        <p className="text-gray-600 text-sm mt-1">{pkg.description}</p>
      </div>

      <div className="text-center mb-4">
        <div className="text-3xl font-bold text-gray-900">
          {pkg.credits.toLocaleString()}
        </div>
        <div className="text-sm text-gray-600">credits</div>

        {pkg.bonus && pkg.bonus > 0 && (
          <div className="flex items-center justify-center gap-1 mt-2">
            <Gift size={16} className="text-green-600" />
            <span className="text-green-600 font-medium">
              +{pkg.bonus} bonus credits
            </span>
          </div>
        )}

        <div className="text-2xl font-bold text-blue-600 mt-2">
          ${pkg.price}
        </div>
        <div className="text-sm text-gray-500">
          ${pricePerCredit.toFixed(3)} per credit
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="text-sm text-gray-700">
          • Total credits: {totalCredits.toLocaleString()}
        </div>
        {pkg.validityDays && (
          <div className="text-sm text-gray-700">
            • Valid for {pkg.validityDays} days
          </div>
        )}
        {pkg.features && pkg.features.map((feature, index) => (
          <div key={index} className="text-sm text-gray-700">
            • {feature}
          </div>
        ))}
      </div>

      <button
        onClick={onPurchase}
        className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
      >
        Purchase Credits
      </button>
    </div>
  );
};

export default CreditPackageCard;