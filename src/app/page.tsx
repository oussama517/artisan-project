import Link from 'next/link';
import type { Metadata } from 'next';
import HeroSearch from '@/components/ui/HeroSearch';

export const metadata: Metadata = {
  title: 'Artisan Marketplace — Find Trusted Local Artisans',
  description: 'Connect with skilled local artisans for repairs, installations, and home services. Verified professionals, easy booking, peace of mind.',
};

const categories = [
  { icon: '🔧', name: 'Plumbing', slug: 'plumbing', count: 142 },
  { icon: '⚡', name: 'Electrical', slug: 'electrical', count: 98 },
  { icon: '🪚', name: 'Carpentry', slug: 'carpentry', count: 76 },
  { icon: '🎨', name: 'Painting', slug: 'painting', count: 64 },
  { icon: '❄️', name: 'AC Repair', slug: 'ac-repair', count: 53 },
  { icon: '🔩', name: 'Appliance Repair', slug: 'appliance-repair', count: 87 },
  { icon: '🔑', name: 'Locksmith', slug: 'locksmith', count: 31 },
  { icon: '🧹', name: 'Cleaning', slug: 'cleaning', count: 112 },
];

const features = [
  {
    icon: '🛡️',
    title: 'Verified Professionals',
    description: 'Every artisan is verified and approved by our team before they can accept bookings.',
  },
  {
    icon: '📅',
    title: 'Easy Booking',
    description: 'Book in seconds. Choose your date, time, and service — we handle the rest.',
  },
  {
    icon: '⭐',
    title: 'Honest Reviews',
    description: 'Read real reviews from customers who have used the service. All reviews are moderated.',
  },
  {
    icon: '💬',
    title: 'Direct Communication',
    description: 'Chat directly with artisans to discuss your needs before and during the booking.',
  },
];

const stats = [
  { value: '10,000+', label: 'Satisfied Customers' },
  { value: '500+', label: 'Verified Artisans' },
  { value: '25,000+', label: 'Bookings Completed' },
  { value: '4.8/5', label: 'Average Rating' },
];

export default function HomePage() {
  return (
    <>
      {/* ─── Hero Section ─────────────────────────────── */}
      <section className="hero">
        <div className="container hero-content animate-fade-in-up">
          <h1>
            Find trusted artisans
            <br />
            <span className="text-gradient">near you</span>
          </h1>
          <p className="hero-subtitle">
            Connect with skilled professionals for repairs, installations, and home services.
            Verified artisans, easy booking, peace of mind.
          </p>

          <HeroSearch />

          <div className="hero-actions" style={{ marginTop: 'var(--space-8)' }}>
            <p style={{ color: 'var(--color-neutral-500)', fontSize: 'var(--text-sm)' }}>
              Popular: <Link href="/services?category=plumbing" style={{ fontWeight: 600 }}>Plumbing</Link> · <Link href="/services?category=electrical" style={{ fontWeight: 600 }}>Electrical</Link> · <Link href="/services?category=ac-repair" style={{ fontWeight: 600 }}>AC Repair</Link> · <Link href="/services?category=painting" style={{ fontWeight: 600 }}>Painting</Link>
            </p>
          </div>
        </div>
      </section>

      {/* ─── Categories ───────────────────────────────── */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-header">
            <h2>Popular Services</h2>
            <p>Browse by category to find the right professional for your needs</p>
          </div>

          <div className="grid grid-4 stagger">
            {categories.map((cat) => (
              <Link href={`/services?category=${cat.slug}`} key={cat.slug} className="category-card animate-fade-in-up">
                <div className="category-icon">{cat.icon}</div>
                <h4 style={{ fontSize: 'var(--text-base)', fontWeight: 600 }}>{cat.name}</h4>
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-neutral-500)' }}>{cat.count} artisans</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ─────────────────────────────── */}
      <section className="section" style={{ background: 'var(--color-neutral-0)' }}>
        <div className="container">
          <div className="section-header">
            <h2>How it works</h2>
            <p>Get your repair done in 3 simple steps</p>
          </div>

          <div className="grid grid-3">
            {[
              { step: '1', title: 'Search & Choose', desc: 'Browse artisans by service, location, and ratings. View profiles, portfolios, and reviews.' },
              { step: '2', title: 'Book Your Slot', desc: 'Select a date and time that works for you. Describe the problem so the artisan can prepare.' },
              { step: '3', title: 'Get It Done', desc: 'The artisan arrives at your location. Arrange payment directly. Leave a review to help others.' },
            ].map((item) => (
              <div key={item.step} className="card card-body" style={{ textAlign: 'center', padding: 'var(--space-10)' }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 'var(--radius-full)',
                  background: 'linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600))',
                  color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 'var(--text-xl)', fontWeight: 800, margin: '0 auto var(--space-5)',
                  fontFamily: 'var(--font-display)'
                }}>
                  {item.step}
                </div>
                <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-3)' }}>{item.title}</h3>
                <p style={{ color: 'var(--color-neutral-500)', fontSize: 'var(--text-sm)', lineHeight: 1.7 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features ────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2>Why Artisan Marketplace?</h2>
            <p>Built for quality, trust, and convenience</p>
          </div>

          <div className="grid grid-2" style={{ gap: 'var(--space-8)' }}>
            {features.map((feature) => (
              <div key={feature.title} className="card card-hover card-body" style={{ display: 'flex', gap: 'var(--space-5)', padding: 'var(--space-8)' }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 'var(--radius-xl)',
                  background: 'var(--color-primary-50)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0
                }}>
                  {feature.icon}
                </div>
                <div>
                  <h4 style={{ marginBottom: 'var(--space-2)' }}>{feature.title}</h4>
                  <p style={{ color: 'var(--color-neutral-500)', fontSize: 'var(--text-sm)', lineHeight: 1.7 }}>
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Stats ────────────────────────────────────── */}
      <section className="section" style={{ background: 'linear-gradient(135deg, var(--color-primary-600) 0%, var(--color-primary-800) 100%)', color: 'white' }}>
        <div className="container">
          <div className="grid grid-4" style={{ textAlign: 'center' }}>
            {stats.map((stat) => (
              <div key={stat.label}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-4xl)', fontWeight: 800 }}>
                  {stat.value}
                </div>
                <div style={{ opacity: 0.8, marginTop: 'var(--space-2)', fontSize: 'var(--text-sm)' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Section ──────────────────────────────── */}
      <section className="section" style={{ textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ marginBottom: 'var(--space-4)' }}>Ready to get started?</h2>
          <p style={{ color: 'var(--color-neutral-500)', marginBottom: 'var(--space-8)', maxWidth: 500, margin: '0 auto var(--space-8)' }}>
            Join thousands of customers and artisans who trust our platform.
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/signup" className="btn btn-primary btn-lg">
              Create Account
            </Link>
            <Link href="/signup?role=ARTISAN" className="btn btn-secondary btn-lg">
              Join as Artisan
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
