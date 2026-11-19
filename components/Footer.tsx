import React from 'react';
import { LinkedInIcon, InstagramIcon, FacebookIcon, TwitterIcon, HomePlatterLogoIcon } from '../constants';
import { useChatbot } from '../providers/ChatbotProvider';

interface FooterProps {
  navigate: (path: string, params?: Record<string, any>) => void;
}

const Footer: React.FC<FooterProps> = ({ navigate }) => {
  const { openChatbot } = useChatbot();

  const socialLinks = [
    { Icon: LinkedInIcon, href: '#', name: 'LinkedIn' },
    { Icon: InstagramIcon, href: '#', name: 'Instagram' },
    { Icon: FacebookIcon, href: '#', name: 'Facebook' },
    { Icon: TwitterIcon, href: '#', name: 'Twitter' },
  ];

  const footerLinks = [
    {
      title: 'Company',
      links: [
        { name: 'About Us', path: '/about-us', action: () => navigate('/about-us') },
        { name: 'Blog', path: '/blog', action: () => navigate('/blog') },
        { name: 'Careers', path: '/careers', action: () => navigate('/careers') },
        { name: 'Investor Relations', path: '/investor-relations', action: () => navigate('/investor-relations') },
      ],
    },
    {
      title: 'Contact us',
      links: [
        { name: 'Help & Support', path: '/help-and-support', action: () => navigate('/help-and-support') },
        { name: 'Partner with us', path: '/partner-with-us', action: () => navigate('/auth', { mode: 'signup', role: 'PROVIDER' }) },
        { name: 'FAQs for Customers', path: '#', action: () => openChatbot({ systemMessage: 'Hello! I see you have a question as a customer. How can I assist you with browsing, ordering, or your account?' }) },
        { name: 'FAQs for Providers', path: '#', action: () => openChatbot({ systemMessage: 'Hello! I see you have a question about being a provider. How can I help with your dashboard, menu, or orders?' }) },
      ],
    },
    {
      title: 'Legal',
      links: [
        { name: 'Terms & Conditions', path: '/terms-and-conditions', action: () => navigate('/terms-and-conditions') },
        { name: 'Cookie Policy', path: '/cookie-policy', action: () => navigate('/cookie-policy') },
        { name: 'Privacy Policy', path: '/privacy-policy', action: () => navigate('/privacy-policy') },
        { name: 'Returns and Refunds Policy', path: '/returns-and-refunds', action: () => navigate('/returns-and-refunds') },
      ],
    },
  ];

  return (
    <footer className="bg-black/20 backdrop-blur-lg border-t border-white/10 mt-16 text-text">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
             <button onClick={() => navigate('/')} className="flex items-center space-x-2 text-left mb-4">
                <HomePlatterLogoIcon className="w-10 h-10" />
                <h1 className="text-3xl font-bold text-text font-serif">
                  Home Platter
                </h1>
            </button>
            <p className="text-text/80 max-w-sm">
                Connecting communities, one homemade meal at a time. Discover authentic food from talented home chefs.
            </p>
          </div>
          
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {footerLinks.map((section) => (
              <div key={section.title}>
                <h3 className="text-lg font-semibold text-text uppercase tracking-wider mb-4">{section.title}</h3>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <button onClick={link.action} className="text-text/80 hover:text-brand-primary transition-colors text-left">
                        {link.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div>
               <h3 className="text-lg font-semibold text-text uppercase tracking-wider mb-4">Social Links</h3>
               <div className="flex space-x-4 mb-6">
                  {socialLinks.map(({ Icon, href, name }) => (
                    <a key={name} href={href} aria-label={name} className="text-text/70 hover:text-brand-primary transition-colors">
                      <Icon className="w-6 h-6" />
                    </a>
                  ))}
                </div>
                 {/* App Store Buttons */}
                  <div className="w-40 mx-auto sm:mx-0">
                      <div className="space-y-4">
                          <a href="#" aria-label="Download on the App Store">
                              <img src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg" alt="App Store" className="w-full h-auto"/>
                          </a>
                          <a href="#" aria-label="Get it on Google Play">
                              <img src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png" alt="Google Play" className="w-full h-auto"/>
                          </a>
                      </div>
                  </div>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-8 text-center">
          <p className="text-text/70 text-sm">&copy; 2025 Home Platter Technologies Inc. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;