import React from 'react';
import { Check, Star, Zap, Crown, Shield } from 'lucide-react';
import { SubscriptionTier, UserSubscription } from '@/services/creditsApi';

interface SubscriptionCardProps {
  tier: SubscriptionTier;
  currentSubscription: UserSubscription | null;
  onUpgrade: () => void;
  onSelectAnnual: () => void;
}

const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  tier,
  currentSubscription,
  onUpgrade,
  onSelectAnnual
}) => {
  const isCurrentTier = currentSubscription?.tierId === tier.id;
  const isHigherTier = currentSubscription &&
    getTierLevel(tier.type) > getTierLevel(currentSubscription.tier.type);

  function getTierLevel(type: string): number {
    const levels = { free: 0, starter: 1, professional: 2, enterprise: 3 };
    return levels[type as keyof typeof levels] || 0;
  }

  const getTierIcon = () => {
    switch (tier.type) {
      case 'starter': return <Zap className="text-blue-600" size={24} />;
      case 'professional': return <Crown className="text-purple-600" size={24} />;
      case 'enterprise': return <Shield className="text-amber-600" size={24} />;
      default: return null;
    }
  };

  const getTierColor = () => {
    switch (tier.type) {
      case 'starter': return 'border-blue-200 bg-blue-50';
      case 'professional': return 'border-purple-200 bg-purple-50';
      case 'enterprise': return 'border-amber-200 bg-amber-50';
      default: return 'border-gray-200 bg-white';
    }
  };

  const monthlyPrice = tier.pricing.monthly;
  const yearlyPrice = tier.pricing.yearly;
  const yearlyDiscount = tier.pricing.discount || 0;

  return (
    <div className={`rounded-lg border-2 p-6 relative ${
      tier.isPopular ? 'border-blue-500 shadow-lg' : getTierColor()
    } ${isCurrentTier ? 'ring-2 ring-green-500' : ''}`}>

      {tier.isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
            <Star size={14} />
            Most Popular
          </span>
        </div>
      )}

      {isCurrentTier && (
        <div className="absolute -top-3 right-4">
          <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            Current Plan
          </span>
        </div>
      )}

      <div className="text-center mb-6">
        <div className="flex items-center justify-center mb-2">
          {getTierIcon()}
        </div>
        <h3 className="text-xl font-bold text-gray-900">{tier.name}</h3>
        <p className="text-gray-600 mt-1">{tier.description}</p>
      </div>

      <div className="text-center mb-6">
        <div className="flex items-baseline justify-center">
          <span className="text-3xl font-bold text-gray-900">
            ${monthlyPrice}
          </span>
          <span className="text-gray-500 ml-1">/month</span>
        </div>

        {yearlyPrice && yearlyDiscount > 0 && (
          <div className="mt-2">
            <div className="text-sm text-gray-600">
              <span className="line-through">${(monthlyPrice * 12).toFixed(0)}</span>
              <span className="ml-2 font-medium text-green-600">
                ${yearlyPrice}/year ({yearlyDiscount}% off)
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3 mb-6">
        <div className="text-sm font-medium text-gray-900">
          {tier.limits.monthlyCredits.toLocaleString()} credits/month
        </div>

        {tier.features.slice(0, 6).map((feature, index) => (
          <div key={index} className="flex items-start gap-2">
            <Check size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
            <span className="text-sm text-gray-700">
              {feature.name}
              {feature.limit && ` (up to ${feature.limit})`}
            </span>
          </div>
        ))}

        {tier.features.length > 6 && (
          <div className="text-sm text-gray-500">
            +{tier.features.length - 6} more features
          </div>
        )}
      </div>

      <div className="space-y-2">
        {isCurrentTier ? (
          <div className="w-full py-2 px-4 bg-green-100 text-green-700 rounded-lg text-center font-medium">
            Current Plan
          </div>
        ) : isHigherTier ? (
          <>
            <button
              onClick={onUpgrade}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Upgrade Monthly
            </button>
            {yearlyPrice && (
              <button
                onClick={onSelectAnnual}
                className="w-full py-2 px-4 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 font-medium"
              >
                Upgrade Yearly (Save {yearlyDiscount}%)
              </button>
            )}
          </>
        ) : (
          <button
            onClick={onUpgrade}
            className="w-full py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
          >
            Downgrade
          </button>
        )}
      </div>

      {tier.trialDays && !isCurrentTier && (
        <div className="mt-3 text-center">
          <span className="text-sm text-gray-600">
            {tier.trialDays}-day free trial included
          </span>
        </div>
      )}
    </div>
  );
};

export default SubscriptionCard;