'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Book, 
  Video, 
  FileText, 
  MessageCircle, 
  Phone, 
  Mail, 
  Download,
  ExternalLink,
  PlayCircle,
  Clock,
  Users,
  Building,
  CreditCard,
  Shield,
  Settings,
  TrendingUp,
  ChevronRight,
  Star,
  ThumbsUp
} from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';
import DashboardLayout from '@/components/layout/dashboard-layout';

export default function HelpCenterPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const helpCategories = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      description: 'Learn the basics of using our platform',
      icon: Book,
      color: 'bg-blue-500',
      articles: 12,
      popular: true
    },
    {
      id: 'buying-guide',
      title: 'Buying Properties',
      description: 'Complete guide to purchasing real estate',
      icon: Building,
      color: 'bg-green-500',
      articles: 18,
      popular: true
    },
    {
      id: 'selling-guide',
      title: 'Selling Properties',
      description: 'How to list and sell your property',
      icon: TrendingUp,
      color: 'bg-purple-500',
      articles: 15,
      popular: false
    },
    {
      id: 'payments',
      title: 'Payments & Billing',
      description: 'Payment methods, invoices, and billing',
      icon: CreditCard,
      color: 'bg-yellow-500',
      articles: 8,
      popular: false
    },
    {
      id: 'account',
      title: 'Account Management',
      description: 'Manage your profile and settings',
      icon: Settings,
      color: 'bg-red-500',
      articles: 10,
      popular: false
    },
    {
      id: 'security',
      title: 'Security & Privacy',
      description: 'Keep your account safe and secure',
      icon: Shield,
      color: 'bg-indigo-500',
      articles: 6,
      popular: false
    }
  ];

  const featuredArticles = [
    {
      id: 1,
      title: 'How to Search for Your Dream Property',
      description: 'Learn how to use our advanced search filters to find the perfect property that matches your criteria.',
      category: 'Buying Guide',
      readTime: '5 min read',
      views: '2.3k',
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=200&fit=crop'
    },
    {
      id: 2,
      title: 'Complete Guide to Property Valuation',
      description: 'Understand how we determine property values and what factors influence market pricing.',
      category: 'Selling Guide',
      readTime: '8 min read',
      views: '1.8k',
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1554469384-e58fac16e23a?w=400&h=200&fit=crop'
    },
    {
      id: 3,
      title: 'Setting Up Your Account for Success',
      description: 'Optimize your profile and preferences to get the most out of our platform.',
      category: 'Getting Started',
      readTime: '3 min read',
      views: '3.1k',
      rating: 4.7,
      image: 'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=400&h=200&fit=crop'
    }
  ];

  const videoTutorials = [
    {
      id: 1,
      title: 'Platform Overview - Getting Started',
      duration: '4:32',
      views: '12k',
      thumbnail: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop'
    },
    {
      id: 2,
      title: 'How to List Your Property',
      duration: '6:18',
      views: '8.5k',
      thumbnail: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=300&h=200&fit=crop'
    },
    {
      id: 3,
      title: 'Making Your First Offer',
      duration: '5:45',
      views: '9.2k',
      thumbnail: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=300&h=200&fit=crop'
    }
  ];

  const quickActions = [
    {
      title: 'Download Mobile App',
      description: 'Get our app for iOS and Android',
      icon: Download,
      action: 'Download',
      link: '#'
    },
    {
      title: 'Schedule a Demo',
      description: 'Book a personalized walkthrough',
      icon: Video,
      action: 'Schedule',
      link: '#'
    },
    {
      title: 'Contact Sales',
      description: 'Speak with our sales team',
      icon: Users,
      action: 'Contact',
      link: '#'
    },
    {
      title: 'System Status',
      description: 'Check our service status',
      icon: ExternalLink,
      action: 'Check',
      link: '#'
    }
  ];

  return (
    <DashboardLayout>
    <div className="min-h-screen bg-gray-50">
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Help Center</h1>
          <p className="text-xl mb-8 opacity-90">
            Everything you need to know about using our real estate platform
          </p>
          
          {/* Search Bar */}
          <div className="bg-white border-rounded- relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search help articles, guides, and tutorials..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-lg text-gray-900 text-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Quick Actions */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid md:grid-cols-4 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Link
                  key={index}
                  href={action.link}
                  className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 hover:border-blue-300"
                >
                  <Icon className="w-8 h-8 text-blue-600 mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-1">{action.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{action.description}</p>
                  <span className="text-blue-600 text-sm font-medium">
                    {action.action} →
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Help Categories */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse by Category</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {helpCategories.map(category => {
              const Icon = category.icon;
              return (
                <Link
                  key={category.id}
                  href={`/help/${category.id}`}
                  className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all border border-gray-200 hover:border-blue-300 group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-lg ${category.color}`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    {category.popular && (
                      <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">
                        Popular
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {category.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">{category.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{category.articles} articles</span>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Featured Articles */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Featured Articles</h2>
            <Link href="/help/articles" className="text-blue-600 hover:text-blue-700 font-medium">
              View all articles →
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {featuredArticles.map(article => (
              <Link
                key={article.id}
                href={`/help/articles/${article.id}`}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-200 hover:border-blue-300"
              >
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {article.category}
                    </span>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-400 fill-current" />
                      <span className="text-xs text-gray-600">{article.rating}</span>
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {article.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {article.readTime}
                    </div>
                    <span>{article.views} views</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Video Tutorials */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Video Tutorials</h2>
            <Link href="/help/videos" className="text-blue-600 hover:text-blue-700 font-medium">
              View all videos →
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {videoTutorials.map(video => (
              <Link
                key={video.id}
                href={`/help/videos/${video.id}`}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-200 hover:border-blue-300 group"
              >
                <div className="relative">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <PlayCircle className="w-12 h-12 text-white" />
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                    {video.duration}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {video.title}
                  </h3>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{video.views} views</span>
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="w-3 h-3" />
                      <span>98%</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Contact Support */}
        <div id='contact' className="bg-white rounded-lg shadow-sm p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Still need help?</h2>
            <p className="text-gray-600">Our support team is available 24/7 to assist you</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
              <MessageCircle className="w-8 h-8 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Live Chat</h3>
              <p className="text-gray-600 text-sm mb-4">
                Get instant help from our support team
              </p>
              <p className="text-xs text-gray-500 mb-4">Average response: 2 minutes</p>
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors w-full">
                Start Chat
              </button>
            </div>

            <div className="text-center p-6 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
              <Phone className="w-8 h-8 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Phone Support</h3>
              <p className="text-gray-600 text-sm mb-4">
                Speak directly with our experts
              </p>
              <p className="text-xs text-gray-500 mb-4">Mon-Fri: 9AM-6PM EST</p>
              <a 
                href="tel:+1-555-123-4567" 
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-block w-full"
              >
                (555) 123-4567
              </a>
            </div>

            <div className="text-center p-6 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
              <Mail className="w-8 h-8 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Email Support</h3>
              <p className="text-gray-600 text-sm mb-4">
                Send us a detailed message
              </p>
              <p className="text-xs text-gray-500 mb-4">Response within 4 hours</p>
              <a 
                href="mailto:support@company.com" 
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-block w-full"
              >
                Send Email
              </a>
            </div>
          </div>

          {/* Additional Support Options */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4">
                <FileText className="w-6 h-6 text-blue-600 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Submit a Ticket</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    Create a support ticket for complex issues
                  </p>
                  <Link href="/help/tickets/new" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    Create Ticket →
                  </Link>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Users className="w-6 h-6 text-blue-600 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Community Forum</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    Connect with other users and share experiences
                  </p>
                  <Link href="/community" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    Join Community →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </DashboardLayout>
  );
}
