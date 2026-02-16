import Link from 'next/link';
import Image from 'next/image';

// Logo Title component matching Navbar styling
function LogoTitle() {
  return (
    <div className="flex items-baseline">
      {/* "Vibhuvi" in purple */}
      <span className="logo-vibhuvi">Vibhuvi</span>
      {/* Space */}
      <span>&nbsp;</span>
      {/* "OiO" with gradient */}
      <span className="logo-oio">OiO</span>
    </div>
  );
}

export default function Footer() {
  return (
    <footer>
      {/* Top section — links and info */}
      <div className="border-t border-gray-200 bg-gray-50 py-10">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col items-center md:items-start">
              {/* Logo with Image + Title */}
              <div className="flex items-center gap-2">
                <Image
                  src="/img/logo.svg"
                  alt=""
                  width={28}
                  height={28}
                  className="h-7 w-7"
                />
                <LogoTitle />
              </div>
              <span className="text-sm text-gray-500 mt-2">Experience The Operations.</span>
              <span className="text-xs text-gray-400 mt-1">Hyderabad, Telangana, India</span>
            </div>

            <div className="flex items-center gap-8 text-sm text-gray-600">
              <Link href="/docs" className="hover:text-gray-900 transition-colors">
                Documentation
              </Link>
              <Link href="/operations" className="hover:text-gray-900 transition-colors">
                Learn
              </Link>
              <Link href="/products" className="hover:text-gray-900 transition-colors">
                Products
              </Link>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom branding band */}
      <div
        className="overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #200289 0%, #2702a6 50%, #3d0fd4 100%)' }}
      >
        <div className="px-4 sm:px-6 lg:px-8 pt-6 pb-4">
          <div className="flex items-baseline justify-center select-none whitespace-nowrap">
            <span className="footer-brand-vibhuvi">Vibhuvi</span>
            <span className="footer-brand-vibhuvi">&nbsp;</span>
            <span className="footer-brand-oio">OiO</span>
          </div>
          <div className="mt-3 text-center text-sm text-white/40">
            Copyright &copy; {new Date().getFullYear()} VibhuviOiO, all rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
