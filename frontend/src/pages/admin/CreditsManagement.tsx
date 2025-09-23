import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  TrendingUp,
  Package,
  Star,
  Settings,
  Download,
  Gift,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3,
  Zap,
  Crown,
  Shield
} from 'lucide-react';
import {
  CreditBalance,
  SubscriptionTier,
  UserSubscription,
  CreditPackage,
  UsageStats,
  creditsApi
} from '@/services/creditsApi';
import { useNotification } from '@/hooks/useNotification';
import SubscriptionCard from '@/components/credits/SubscriptionCard';
import CreditPackageCard from '@/components/credits/CreditPackageCard';
import UsageStatsPanel from '@/components/credits/UsageStatsPanel';
import CreditTransactionsTable from '@/components/credits/CreditTransactionsTable';
import UpgradeModal from '@/components/credits/UpgradeModal';
import PurchaseCreditsModal from '@/components/credits/PurchaseCreditsModal';

const CreditsManagement: React.FC = () => {
  const [balance, setBalance] = useState<CreditBalance | null>(null);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [tiers, setTiers] = useState<SubscriptionTier[]>([]);
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'plans' | 'credits' | 'usage' | 'history'>('overview');

  // Modals
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  const { showNotification } = useNotification();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [balanceRes, subscriptionRes, tiersRes, packagesRes, usageRes] = await Promise.all([
        creditsApi.getCreditBalance(),
        creditsApi.getCurrentSubscription(),
        creditsApi.getSubscriptionTiers(),
        creditsApi.getCreditPackages(),
        creditsApi.getUsageStats()
      ]);

      if (balanceRes.success && balanceRes.data) setBalance(balanceRes.data);
      if (subscriptionRes.success && subscriptionRes.data) setSubscription(subscriptionRes.data);
      if (tiersRes.success && tiersRes.data) setTiers(tiersRes.data);
      if (packagesRes.success && packagesRes.data) setPackages(packagesRes.data);
      if (usageRes.success && usageRes.data) setUsageStats(usageRes.data);
    } catch (error) {
      showNotification('Failed to load credits data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscriptionChange = async (tierId: string, billingCycle: 'monthly' | 'yearly') => {
    try {
      const response = await creditsApi.changeSubscription({ tierId, billingCycle });
      if (response.success && response.data) {
        setSubscription(response.data);
        showNotification('Subscription updated successfully', 'success');
        loadData();
      }
    } catch (error) {
      showNotification('Failed to update subscription', 'error');
    }
  };

  const handleCreditsPurchase = async (packageId: string) => {
    try {
      const response = await creditsApi.purchaseCredits({ packageId });
      if (response.success && response.data) {
        showNotification(`${response.data.creditsAdded} credits added successfully`, 'success');
        loadData();
      }
    } catch (error) {
      showNotification('Failed to purchase credits', 'error');
    }
  };

  const getTierIcon = (type: string) => {
    switch (type) {
      case 'free': return <Gift size={20} className="text-gray-600" />;
      case 'starter': return <Zap size={20} className="text-blue-600" />;
      case 'professional': return <Crown size={20} className="text-purple-600" />;
      case 'enterprise': return <Shield size={20} className="text-gold-600" />;
      default: return <Package size={20} className="text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      active: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      trial: { color: 'bg-blue-100 text-blue-800', icon: Clock },
      canceled: { color: 'bg-red-100 text-red-800', icon: AlertCircle },
      expired: { color: 'bg-gray-100 text-gray-800', icon: AlertCircle }
    };

    const badge = badges[status as keyof typeof badges] || badges.active;
    const IconComponent = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        <IconComponent size={12} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading credits data...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Credits & Subscription</h1>
          <p className="text-gray-600">
            Manage your credits, subscription plans, and billing
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPurchaseModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <CreditCard size={16} />
            Buy Credits
          </button>
          <button
            onClick={() => setShowUpgradeModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <TrendingUp size={16} />
            Upgrade Plan
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      {balance && subscription && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Current Credits</p>
                <p className="text-3xl font-bold">{balance.currentBalance.toLocaleString()}</p>
              </div>
              <CreditCard size={32} className="text-blue-200" />
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">Current Plan</p>
                <p className="text-xl font-bold text-gray-900">{subscription.tier.name}</p>
                {getStatusBadge(subscription.status)}
              </div>
              {getTierIcon(subscription.tier.type)}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">Monthly Allowance</p>
                <p className="text-xl font-bold text-gray-900">{balance.monthlyAllowance.toLocaleString()}</p>
                <p className="text-sm text-gray-500">Resets {balance.nextResetDate ? new Date(balance.nextResetDate).toLocaleDateString() : 'N/A'}</p>
              </div>
              <Package size={24} className="text-gray-400" />
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">This Month Used</p>
                <p className="text-xl font-bold text-gray-900">
                  {usageStats?.currentPeriod.creditsUsed.toLocaleString() || '0'}
                </p>
                <p className="text-sm text-gray-500">
                  {usageStats?.currentPeriod.creditsRemaining.toLocaleString() || '0'} remaining
                </p>
              </div>
              <BarChart3 size={24} className="text-gray-400" />
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'plans', label: 'Subscription Plans', icon: Star },
            { id: 'credits', label: 'Credit Packages', icon: CreditCard },
            { id: 'usage', label: 'Usage Analytics', icon: TrendingUp },
            { id: 'history', label: 'Transaction History', icon: Clock }
          ].map(tab => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <IconComponent size={16} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && usageStats && (
          <UsageStatsPanel stats={usageStats} subscription={subscription} />
        )}

        {activeTab === 'plans' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {tiers.map(tier => (
              <SubscriptionCard
                key={tier.id}
                tier={tier}
                currentSubscription={subscription}
                onUpgrade={() => handleSubscriptionChange(tier.id, 'monthly')}
                onSelectAnnual={() => handleSubscriptionChange(tier.id, 'yearly')}
              />
            ))}
          </div>
        )}

        {activeTab === 'credits' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map(pkg => (
              <CreditPackageCard
                key={pkg.id}
                package={pkg}
                onPurchase={() => handleCreditsPurchase(pkg.id)}
              />
            ))}
          </div>
        )}

        {activeTab === 'usage' && usageStats && (
          <UsageStatsPanel stats={usageStats} subscription={subscription} detailed />
        )}

        {activeTab === 'history' && (
          <CreditTransactionsTable />
        )}
      </div>

      {/* Modals */}
      {showUpgradeModal && (
        <UpgradeModal
          tiers={tiers}
          currentSubscription={subscription}
          onClose={() => setShowUpgradeModal(false)}
          onUpgrade={handleSubscriptionChange}
        />
      )}

      {showPurchaseModal && (
        <PurchaseCreditsModal
          packages={packages}
          currentBalance={balance?.currentBalance || 0}
          onClose={() => setShowPurchaseModal(false)}
          onPurchase={handleCreditsPurchase}
        />
      )}
    </div>
  );
};

export default CreditsManagement;