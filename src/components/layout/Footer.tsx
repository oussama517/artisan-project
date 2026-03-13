import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="footer-brand">⚒ Artisan Marketplace</div>
            <p style={{ maxWidth: 320, lineHeight: 1.7, fontSize: 'var(--text-sm)' }}>
              Connecting you with trusted local artisans for all your repair and home service needs. Quality work, verified professionals.
            </p>
          </div>

          <div>
            <h4 className="footer-heading">Company</h4>
            <Link href="/about" className="footer-link">About Us</Link>
            <Link href="/careers" className="footer-link">Careers</Link>
            <Link href="/press" className="footer-link">Press</Link>
            <Link href="/signup?role=ARTISAN" className="footer-link">Become an Artisan</Link>
          </div>

          <div>
            <h4 className="footer-heading">Support</h4>
            <Link href="/help" className="footer-link">Help Center</Link>
            <Link href="/contact" className="footer-link">Contact Us</Link>
            <Link href="/faq" className="footer-link">FAQ</Link>
            <Link href="/safety" className="footer-link">Safety</Link>
          </div>

          <div>
            <h4 className="footer-heading">Legal</h4>
            <Link href="/privacy" className="footer-link">Privacy Policy</Link>
            <Link href="/terms" className="footer-link">Terms of Service</Link>
            <Link href="/cookies" className="footer-link">Cookie Policy</Link>
            <Link href="/accessibility" className="footer-link">Accessibility</Link>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {currentYear} Artisan Marketplace. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
