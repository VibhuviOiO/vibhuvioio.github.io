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
    <footer className="border-t border-gray-200 bg-gray-50 py-8">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
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
            <span className="text-sm text-gray-500 mt-1">Experience The Operations.</span>
            <span className="text-xs text-gray-400 mt-1">Hyderabad, Telangana, India</span>
          </div>
          
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <Link href="/docs" className="hover:text-gray-900 transition-colors">
              Documentation
            </Link>
            <Link href="/operations" className="hover:text-gray-900 transition-colors">
              Operations
            </Link>
            <Link href="/products" className="hover:text-gray-900 transition-colors">
              Products
            </Link>
          </div>
        </div>
        
        <div className="mt-8 text-center text-sm text-gray-400">
          © {new Date().getFullYear()} VibhuviOiO.
        </div>
      </div>
    </footer>
  );
}
