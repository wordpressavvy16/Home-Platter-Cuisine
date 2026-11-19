interface PageMeta {
  slug: string;
  title: string;
}

export const staticPageMap: Record<string, PageMeta> = {
  '/about-us': { slug: 'about-us', title: 'About Us' },
  '/blog': { slug: 'blog', title: 'Our Blog' },
  '/careers': { slug: 'careers', title: 'Careers at Home Platter' },
  '/investor-relations': { slug: 'investor-relations', title: 'Investor Relations' },
  '/help-and-support': { slug: 'help-and-support', title: 'Help & Support' },
  '/terms-and-conditions': { slug: 'terms-and-conditions', title: 'Terms & Conditions' },
  '/cookie-policy': { slug: 'cookie-policy', title: 'Cookie Policy' },
  '/privacy-policy': { slug: 'privacy-policy', title: 'Privacy Policy' },
  '/returns-and-refunds': { slug: 'returns-and-refunds', title: 'Returns and Refunds Policy' },
  '/partner-with-us': { slug: 'partner-with-us', title: 'Partner With Us' },
};