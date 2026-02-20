import Link from 'next/link';
import Image from 'next/image';
import { Github, Twitter, Linkedin, Mail } from 'lucide-react';

// Logo Title component matching Navbar styling
function LogoTitle() {
  return (
    <div className="flex items-baseline">
      <span className="text-lg font-bold text-[#2702a6]">Vibhuvi</span>
      <span>&nbsp;</span>
      <span className="text-lg font-bold bg-gradient-to-r from-[#00bcd4] via-[#2702a6] to-[#00bcd4] bg-clip-text text-transparent">OiO</span>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="bg-gray-50">
      {/* Top section — links and info */}
      <div className="border-t border-gray-200 bg-gray-50 py-12">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Brand Column */}
            <div className="flex flex-col items-center md:items-start">
              {/* Logo with Image + Title */}
              <div className="flex items-center gap-2.5">
                <Image
                  src="/img/logo.svg"
                  alt=""
                  width={36}
                  height={36}
                  className="h-9 w-9"
                />
                <LogoTitle />
              </div>
              <p className="text-[15px] text-gray-600 mt-4 leading-relaxed text-center md:text-left">
                Experience The Operations.<br />
                Infrastructure tools that just work.
              </p>
              <span className="text-[13px] text-gray-400 mt-3">Hyderabad, Telangana, India</span>
              
              {/* Social Links */}
              <div className="flex items-center gap-4 mt-5">
                <a href="https://github.com/vibhuviOiO" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-[#2702a6] hover:text-white transition-all">
                  <Github className="h-5 w-5" />
                </a>
                <a href="https://www.linkedin.com/company/vibhuvi-oio/" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-[#2702a6] hover:text-white transition-all">
                  <Linkedin className="h-5 w-5" />
                </a>
                <a href="mailto:contact@vibhuvioio.com" className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-[#2702a6] hover:text-white transition-all">
                  <Mail className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Resources Column */}
            <div className="flex flex-col items-center md:items-start">
              <h4 className="text-[15px] font-bold text-gray-900 mb-4 uppercase tracking-wider">Resources</h4>
              <div className="flex flex-col gap-3 text-[15px]">
                <Link href="/docs" className="text-gray-600 hover:text-[#2702a6] transition-colors font-medium">
                  Documentation
                </Link>
                <Link href="/learn" className="text-gray-600 hover:text-[#2702a6] transition-colors font-medium">
                  Learn & Courses
                </Link>
                <Link href="/products" className="text-gray-600 hover:text-[#2702a6] transition-colors font-medium">
                  All Products
                </Link>
              </div>
            </div>

            {/* Products Column */}
            <div className="flex flex-col items-center md:items-start">
              <h4 className="text-[15px] font-bold text-gray-900 mb-4 uppercase tracking-wider">Products</h4>
              <div className="flex flex-col gap-3 text-[15px]">
                <Link href="/docker-registry-ui" className="text-gray-600 hover:text-[#2702a6] transition-colors font-medium">
                  Docker Registry UI
                </Link>
                <Link href="/ldap-manager" className="text-gray-600 hover:text-[#2702a6] transition-colors font-medium">
                  LDAP Manager
                </Link>
                <Link href="/openldap-docker" className="text-gray-600 hover:text-[#2702a6] transition-colors font-medium">
                  OpenLDAP Docker
                </Link>
                <Link href="/products" className="text-gray-600 hover:text-[#2702a6] transition-colors font-medium">
                  View All →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom branding band - Large decorative logo with darker primary */}
      <div
        className="overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0a0540 0%, #150873 30%, #1a0a8a 70%, #0f0550 100%)' }}
      >
        <div className="px-4 sm:px-6 lg:px-8 pt-10 pb-8">
          {/* Large decorative brand text - OiO larger than Vibhuvi */}
          <div className="flex items-baseline justify-center select-none whitespace-nowrap">
            <span className="text-[clamp(3.5rem,11vw,8rem)] font-black text-white tracking-tight">Vibhuvi</span>
            <span className="w-8 sm:w-12 md:w-16"></span>
            <span className="text-[clamp(4rem,13vw,9rem)] font-black bg-gradient-to-r from-[#00e5ff] via-white to-[#00e5ff] bg-clip-text text-transparent tracking-tight">OiO</span>
          </div>
          <div className="mt-4 text-center text-[15px] text-white/50">
            Copyright &copy; {new Date().getFullYear()} VibhuviOiO. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
