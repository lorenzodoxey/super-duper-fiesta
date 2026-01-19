import { Check } from 'lucide-react';
import './Pricing.css';

interface PricingProps {
  repId: string | null;
  onClose: () => void;
}

export default function Pricing({ repId, onClose }: PricingProps) {
  const plans = [
    {
      name: 'Starter',
      price: 29,
      description: 'Perfect for solo reps',
      features: [
        'Up to 50 appointments',
        'Cloud sync across devices',
        'Map view with pins',
        'Drive time calculations',
        'Email support',
      ],
      popular: false,
      cta: 'Get Started',
    },
    {
      name: 'Professional',
      price: 79,
      description: 'For growing teams',
      features: [
        'Up to 200 appointments',
        'Cloud sync across devices',
        'Map view with pins',
        'Drive time calculations',
        'Priority email support',
        'Team collaboration',
        'Advanced analytics',
      ],
      popular: true,
      cta: 'Most Popular',
    },
    {
      name: 'Enterprise',
      price: 199,
      description: 'For large organizations',
      features: [
        'Unlimited appointments',
        'Cloud sync across devices',
        'Map view with pins',
        'Drive time calculations',
        'Priority phone support',
        'Team collaboration',
        'Advanced analytics',
        'Admin dashboard',
        'Custom branding',
      ],
      popular: false,
      cta: 'Contact Us',
    },
  ];

  return (
    <div className="pricing-overlay">
      <div className="pricing-container">
        <div className="pricing-header">
          <h1>Simple, Transparent Pricing</h1>
          <p>Choose the plan that's right for you</p>
          <button className="pricing-close" onClick={onClose}>×</button>
        </div>

        <div className="pricing-grid">
          {plans.map((plan) => (
            <div 
              key={plan.name}
              className={`pricing-card ${plan.popular ? 'popular' : ''}`}
            >
              {plan.popular && <div className="pricing-badge">Most Popular</div>}
              
              <h2 className="pricing-name">{plan.name}</h2>
              <p className="pricing-description">{plan.description}</p>
              
              <div className="pricing-price">
                <span className="currency">$</span>
                <span className="amount">{plan.price}</span>
                <span className="period">/month</span>
              </div>

              <button 
                className={`pricing-button ${plan.popular ? 'primary' : 'secondary'}`}
                onClick={() => {
                  // TODO: Integrate with Stripe
                  alert(`${plan.name} plan - Coming soon! Stripe integration in progress.`);
                }}
              >
                {plan.cta}
              </button>

              <div className="pricing-features">
                {plan.features.map((feature) => (
                  <div key={feature} className="pricing-feature">
                    <Check size={16} className="feature-icon" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="pricing-faq">
          <h3>Frequently Asked Questions</h3>
          
          <div className="faq-item">
            <h4>Can I try for free?</h4>
            <p>Yes! All features work free with up to 5 appointments. Upgrade anytime.</p>
          </div>
          
          <div className="faq-item">
            <h4>Can I cancel anytime?</h4>
            <p>Absolutely. No contracts, cancel with one click.</p>
          </div>
          
          <div className="faq-item">
            <h4>Do you offer team discounts?</h4>
            <p>Yes! Contact sales for volume discounts.</p>
          </div>
          
          <div className="faq-item">
            <h4>What payment methods do you accept?</h4>
            <p>Credit/debit cards via Stripe. We also offer invoicing for teams.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
