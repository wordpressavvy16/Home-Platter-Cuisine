import React, { useState, useEffect } from 'react';
import StaticPageLayout from './StaticPageLayout';
import Loader from '../Loader';
import { CheckCircleIcon } from '../../constants';

// --- New Component Definition for Partner Inquiry Form ---
const PartnerInquiryForm: React.FC = () => {
    const [submitted, setSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        companyName: '',
        partnershipType: 'DELIVERY_PARTNER',
        email: '',
        message: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, this would make an API call
        console.log("Simulating inquiry submission:", formData);
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <div className="p-6 bg-green-50 border-l-4 border-green-500 text-green-800 rounded-lg my-4">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <CheckCircleIcon className="h-5 w-5 text-green-400" />
                    </div>
                    <div className="ml-3">
                        <h3 className="text-lg font-medium">Thank You!</h3>
                        <div className="mt-2 text-sm">
                            <p>Your inquiry has been received. Our partnerships team will get back to you shortly.</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-6 border rounded-lg bg-gray-50 my-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input type="text" name="fullName" id="fullName" value={formData.fullName} onChange={handleChange} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" />
                </div>
                <div>
                    <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">Business/Company Name</label>
                    <input type="text" name="companyName" id="companyName" value={formData.companyName} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="partnershipType" className="block text-sm font-medium text-gray-700">Type of Partnership</label>
                    <select id="partnershipType" name="partnershipType" value={formData.partnershipType} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm bg-white">
                        <option value="DELIVERY_PARTNER">Delivery Partner</option>
                        <option value="INGREDIENT_SUPPLIER">Ingredient Supplier</option>
                        <option value="TECHNOLOGY_PARTNER">Technology Partner</option>
                        <option value="OTHER">Other</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                    <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" />
                </div>
            </div>
            <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
                <textarea id="message" name="message" rows={4} value={formData.message} onChange={handleChange} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"></textarea>
            </div>
            <div>
                <button type="submit" className="w-full bg-brand-primary text-white font-semibold py-2 px-4 rounded-lg hover:bg-brand-dark transition-colors">
                    Submit Inquiry
                </button>
            </div>
        </form>
    );
};
// --- End of New Component ---


interface StaticPageRendererProps {
  slug: string;
  title: string;
  navigate: (path: string, params?: Record<string, any>) => void;
  onCartClick: () => void;
}

const StaticPageRenderer: React.FC<StaticPageRendererProps> = ({ slug, title, navigate, onCartClick }) => {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchContent = async () => {
      setIsLoading(true);
      setError('');
      try {
        const response = await fetch(`/content/pages/${slug}.md`);
        if (!response.ok) {
          throw new Error('Content not found.');
        }
        const text = await response.text();
        setContent(text);
      } catch (err: any) {
        setError(err.message || 'Could not load page content.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchContent();
  }, [slug]);

  const parseMarkdown = (text: string) => {
    const parseLine = (line: string, lineIndex: number) => {
      // Regex to split by Markdown links or bold text, keeping the delimiters
      const regex = /(\[.*?\]\(.*?\))|(\*\*.*?\*\*)/g;
      const parts = line.split(regex).filter(Boolean);

      return parts.map((part, partIndex) => {
        const key = `${lineIndex}-${partIndex}`;

        // Check if it's a link: [text](url)
        const linkMatch = /\[(.*?)\]\((.*?)\)/.exec(part);
        if (linkMatch) {
          return <a key={key} href={linkMatch[2]} className="text-brand-primary hover:underline font-semibold">{linkMatch[1]}</a>;
        }

        // Check if it's bold: **text**
        const boldMatch = /\*\*(.*?)\*\*/.exec(part);
        if (boldMatch) {
          return <strong key={key}>{boldMatch[1]}</strong>;
        }
        
        // Otherwise, it's plain text
        return part;
      });
    };

    return text.split('\n').map((line, index) => {
      // Check for the dynamic form tag
      if (line.trim() === '{{FORM:PARTNER_INQUIRY}}') {
        return <PartnerInquiryForm key={index} />;
      }
      if (line.startsWith('### ')) {
        return <h3 key={index} className="text-xl font-bold mt-6 mb-2">{line.substring(4)}</h3>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={index} className="text-2xl font-bold mt-8 mb-3">{line.substring(3)}</h2>;
      }
      if (line.startsWith('# ')) {
        return <h1 key={index} className="text-3xl font-bold mt-10 mb-4 font-serif">{line.substring(2)}</h1>;
      }
      if (line.startsWith('* ')) {
          return <li key={index} className="ml-5 list-disc">{parseLine(line.substring(2), index)}</li>;
      }

      return line.trim() === '' ? <div key={index} className="h-4"></div> : <p key={index} className="my-2 leading-relaxed">{parseLine(line, index)}</p>;
    });
  };

  return (
    <StaticPageLayout title={title} navigate={navigate} onCartClick={onCartClick}>
      {isLoading && <Loader text="Loading content..." />}
      {error && <p className="text-red-500">{error}</p>}
      {!isLoading && !error && (
        <>{parseMarkdown(content)}</>
      )}
    </StaticPageLayout>
  );
};

export default StaticPageRenderer;