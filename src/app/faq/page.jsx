'use client';
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Search, MessageCircle, Phone, Mail, FileText, Users, Building, CreditCard, Shield, HelpCircle } from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';
import DashboardLayout from '@/components/layout/dashboard-layout';

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [expandedItems, setExpandedItems] = useState(new Set());

  const categories = [
    { id: 'all', name: 'All Topics', icon: HelpCircle },
    { id: 'buying', name: 'Buying Properties', icon: Building },
    { id: 'selling', name: 'Selling Properties', icon: FileText },
    { id: 'payments', name: 'Payments & Billing', icon: CreditCard },
    { id: 'account', name: 'Account Management', icon: Users },
    { id: 'security', name: 'Security & Privacy', icon: Shield }
  ];

  const faqData = [
    {
      id: 1,
      category: 'buying',
      question: 'How do I search for properties on your platform?',
      answer: 'You can search for properties using our advanced search feature. Use filters like location, price range, property type, number of bedrooms, and amenities to find properties that match your criteria. You can also save your searches and set up alerts for new listings.'
    },
    {
      id: 2,
      category: 'buying',
      question: 'What information do I need to provide to make an offer?',
      answer: 'To make an offer, you\'ll need to provide your full name, contact information, proof of funds or pre-approval letter, desired purchase price, and any special conditions. Our platform guides you through the entire process step by step.'
    },
    {
      id: 3,
      category: 'buying',
      question: 'How long does the buying process typically take?',
      answer: 'The buying process typically takes 30-45 days from offer acceptance to closing. This includes time for inspections, appraisals, financing, and final paperwork. Cash purchases can close faster, sometimes in 2-3 weeks.'
    },
    {
      id: 4,
      category: 'selling',
      question: 'How do I list my property for sale?',
      answer: 'To list your property, create an account, click "List Property," and fill out the detailed form with property information, photos, and pricing. Our team will review your listing within 24 hours and help optimize it for maximum visibility.'
    },
    {
      id: 5,
      category: 'selling',
      question: 'What fees are associated with selling through your platform?',
      answer: 'Our platform charges a competitive commission rate of 2.5% for sellers, which is lower than traditional real estate agents. This includes professional photography, marketing, and full support throughout the selling process.'
    },
    {
      id: 6,
      category: 'selling',
      question: 'How do you determine the market value of my property?',
      answer: 'We use advanced algorithms that analyze recent comparable sales, market trends, property features, and local market conditions. You\'ll also get a free consultation with our market experts to discuss pricing strategy.'
    },
    {
      id: 7,
      category: 'payments',
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, bank transfers, wire transfers, and certified checks. For large transactions, we recommend wire transfers for security and speed. All payments are processed through secure, encrypted channels.'
    },
    {
      id: 8,
      category: 'payments',
      question: 'When are commission fees charged?',
      answer: 'Commission fees are only charged upon successful completion of a transaction. For sellers, fees are deducted from the sale proceeds at closing. For buyers using our services, fees are clearly outlined before any agreement.'
    },
    {
      id: 9,
      category: 'payments',
      question: 'Can I get a refund if I\'m not satisfied?',
      answer: 'We offer a satisfaction guarantee. If you\'re not happy with our services within the first 30 days, we\'ll work to resolve any issues. Refund policies vary by service type and are detailed in your service agreement.'
    },
    {
      id: 10,
      category: 'account',
      question: 'How do I create an account?',
      answer: 'Click "Sign Up" on our homepage, provide your email address, create a secure password, and verify your email. You can also sign up using your Google or Facebook account for faster registration.'
    },
    {
      id: 11,
      category: 'account',
      question: 'How do I reset my password?',
      answer: 'Click "Forgot Password" on the login page, enter your email address, and we\'ll send you a secure reset link. Follow the instructions in the email to create a new password. The reset link expires after 24 hours for security.'
    },
    {
      id: 12,
      category: 'account',
      question: 'Can I update my profile information?',
      answer: 'Yes, you can update your profile information anytime by going to Account Settings. You can change your contact information, preferences, notification settings, and profile photo. Some changes may require email verification.'
    },
    {
      id: 13,
      category: 'security',
      question: 'How do you protect my personal information?',
      answer: 'We use bank-level encryption (SSL 256-bit) to protect all data transmission. Your personal information is stored on secure servers and never shared with third parties without your consent. We comply with all data protection regulations.'
    },
    {
      id: 14,
      category: 'security',
      question: 'Is it safe to make payments through your platform?',
      answer: 'Absolutely. All payments are processed through PCI-compliant payment processors. We use tokenization to protect your payment information and never store complete credit card numbers on our servers.'
    },
    {
      id: 15,
      category: 'security',
      question: 'What should I do if I suspect fraudulent activity?',
      answer: 'Contact our security team immediately at security@company.com or call our 24/7 hotline. We\'ll investigate any suspicious activity and take appropriate action to protect your account. We also recommend changing your password immediately.'
    }
  ];

  const toggleExpanded = (id) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const filteredFAQs = faqData.filter(faq => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch = searchTerm === '' || 
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
          <DashboardLayout>

    <div className="min-h-screen bg-gray-50">
      
      {/* Hero Section */}
      <div className=" text-blue-600  py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">How can we help you?</h1>
          <p className="text-xl mb-8 opacity-90">
            Find answers to common questions about buying, selling, and managing properties
          </p>
          
          {/* Search Bar */}
          <div className="rounded-r-sm  relative max-w-2xl mx-auto">
            <Search className=" absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search for answers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className=" w-full pl-12 pr-4 py-4 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Categories Sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
              <h3 className="font-semibold text-gray-900 mb-4">Categories</h3>
              <div className="space-y-2">
                {categories.map(category => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setActiveCategory(category.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeCategory === category.id
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm">{category.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* FAQ Content */}
          <div className="lg:w-3/4">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">
                  {activeCategory === 'all' ? 'All Questions' : 
                   categories.find(c => c.id === activeCategory)?.name}
                </h2>
                <p className="text-gray-600 mt-1">
                  {filteredFAQs.length} question{filteredFAQs.length !== 1 ? 's' : ''} found
                </p>
              </div>

              <div className="divide-y divide-gray-200">
                {filteredFAQs.map(faq => (
                  <div key={faq.id} className="p-6">
                    <button
                      onClick={() => toggleExpanded(faq.id)}
                      className="w-full flex items-center justify-between text-left group"
                    >
                      <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                        {faq.question}
                      </h3>
                      {expandedItems.has(faq.id) ? (
                        <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0 ml-4" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0 ml-4" />
                      )}
                    </button>
                    
                    {expandedItems.has(faq.id) && (
                      <div className="mt-4 text-gray-600 leading-relaxed">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {filteredFAQs.length === 0 && (
                <div className="p-12 text-center">
                  <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No questions found</h3>
                  <p className="text-gray-600">
                    Try adjusting your search terms or browse different categories.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="mt-16 bg-white rounded-lg shadow-sm p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Still need help?</h2>
            <p className="text-gray-600">Our support team is here to assist you</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
              <MessageCircle className="w-8 h-8 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Live Chat</h3>
              <p className="text-gray-600 text-sm mb-4">Chat with our support team in real-time</p>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Start Chat
              </button>
            </div>

            <div className="text-center p-6 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
              <Phone className="w-8 h-8 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Phone Support</h3>
              <p className="text-gray-600 text-sm mb-4">Call us Monday-Friday, 9AM-6PM EST</p>
              <a href="tel:+1-555-123-4567" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-block">
                (555) 123-4567
              </a>
            </div>

            <div className="text-center p-6 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
              <Mail className="w-8 h-8 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Email Support</h3>
              <p className="text-gray-600 text-sm mb-4">We'll respond within 24 hours</p>
              <a href="mailto:support@company.com" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-block">
                Send Email
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
    </DashboardLayout>
  );
}
