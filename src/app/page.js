'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Building, Users, Award, TrendingUp, MapPin, Phone, Mail, Star, CheckCircle, X, Home, Info, Search, Calculator, MessageSquare } from 'lucide-react';
import {Navbar ,navLinks} from '@/components/layout/navbar';

export default function HomePage() {

  const stats = [
    { icon: Building, value: '4,860', label: 'Properties Managed', growth: '+98%' },
    { icon: TrendingUp, value: '$2B', label: 'Asset Value', growth: '+72%' },
    { icon: Users, value: '1,037', label: 'Properties Sold', growth: '+44%' },
    { icon: Star, value: '895', label: 'Happy Clients', growth: '+70%' }
  ];

  const team = [
    {
      name: 'Sarah Johnson',
      role: 'CEO & Founder',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b332d891?w=300&h=300&fit=crop&crop=face',
      experience: '15+ years',
      specialty: 'Luxury Properties'
    },
    {
      name: 'Michael Chen',
      role: 'Head of Sales',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face',
      experience: '12+ years',
      specialty: 'Commercial Real Estate'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Property Manager',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face',
      experience: '10+ years',
      specialty: 'Residential Properties'
    }
  ];

  const values = [
    {
      icon: CheckCircle,
      title: 'Integrity First',
      description: 'We believe in transparent, honest dealings with every client and partner.'
    },
    {
      icon: TrendingUp,
      title: 'Market Excellence',
      description: 'Deep market knowledge and data-driven insights guide every decision.'
    },
    {
      icon: Users,
      title: 'Client Focused',
      description: 'Your success is our success. We prioritize your needs above all else.'
    },
    {
      icon: Award,
      title: 'Innovation',
      description: 'Leveraging cutting-edge technology to deliver superior real estate solutions.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50" >
     <Navbar/>
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-600/10 to-blue-600/10"></div>
        <div className="relative max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-6 py-2 mb-6 border border-teal-200/50">
            <Building className="w-5 h-5 text-teal-600" />
            <span className="text-teal-700 font-medium">Premium Real Estate Solutions</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Building Dreams,
            <span className="bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent"> Creating Value</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            With over two decades of excellence in real estate, we've helped thousands of clients 
            find their perfect properties and maximize their investments across premium markets.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <button className="bg-gradient-to-r from-teal-500 to-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-teal-600 hover:to-blue-700 transition-all duration-300 shadow-xl hover:shadow-2xl">
              Explore Properties
            </button>
            <button className="bg-white/80 backdrop-blur-sm text-gray-700 px-8 py-4 rounded-xl font-semibold hover:bg-white transition-all duration-300 border border-gray-200/50">
              Meet Our Team
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 text-center shadow-xl border border-white/20 hover:bg-white/80 transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl mx-auto mb-4 flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-gray-600 text-sm mb-2">{stat.label}</div>
                <div className="text-green-600 text-xs font-semibold">{stat.growth} last year</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 px-4" id="story">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Story</h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Founded in 2003, Estate began with a simple vision: to revolutionize the real estate 
                experience through technology, transparency, and unmatched service. What started as a 
                small firm has grown into one of the region's most trusted real estate companies.
              </p>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Today, we manage over $2 billion in assets, have facilitated thousands of successful 
                transactions, and continue to set new standards in the industry through innovation 
                and client-first approach.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-600" />
                  <span className="text-gray-700">Licensed in 12+ states</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-600" />
                  <span className="text-gray-700">Award-winning customer service</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-600" />
                  <span className="text-gray-700">Technology-driven solutions</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-teal-100 to-blue-100 rounded-2xl p-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-blue-500/10"></div>
                <img 
                  src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=400&fit=crop"
                  alt="Modern office building"
                  className="w-full h-80 object-cover rounded-xl shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section id="services" className="py-20 px-4 bg-white/30 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Core Values</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The principles that guide every decision and drive our commitment to excellence
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-blue-600 rounded-2xl mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <value.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Meet Our Leadership</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experienced professionals dedicated to delivering exceptional real estate solutions
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div key={index} className="bg-white/70 backdrop-blur-xl rounded-2xl p-8 text-center shadow-xl border border-white/20 hover:bg-white/80 transition-all duration-300 group">
                <div className="relative mb-6">
                  <img 
                    src={member.image}
                    alt={member.name}
                    className="w-24 h-24 rounded-full mx-auto object-cover ring-4 ring-teal-100 group-hover:ring-teal-200 transition-all duration-300"
                  />
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-teal-500 to-blue-600 rounded-full flex items-center justify-center">
                    <Star className="w-4 h-4 text-white fill-current" />
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                <p className="text-teal-600 font-semibold mb-2">{member.role}</p>
                <p className="text-gray-600 text-sm mb-2">{member.experience} experience</p>
                <p className="text-gray-500 text-sm">{member.specialty}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-teal-600 to-blue-600 relative overflow-hidden" id='contact'>
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl font-bold mb-6">Ready to Begin Your Real Estate Journey?</h2>
          <p className="text-xl mb-8 opacity-90">
            Let our expert team help you navigate the market and achieve your property goals
          </p>
          
          <div className="flex flex-wrap justify-center gap-6 mb-8">
            <div className="flex items-center gap-2">
              <Phone className="w-5 h-5" />
              <span className="font-semibold">+1 (555) 123-4567</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              <span className="font-semibold">hello@estate.com</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              <span className="font-semibold">Downtown Financial District</span>
            </div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4">
            <button className="bg-white text-teal-600 px-8 py-4 rounded-xl font-bold hover:bg-gray-50 transition-all duration-300 shadow-xl hover:shadow-2xl">
              Schedule Consultation
            </button>
            <Link href="/register">
            <button className="bg-white/20 backdrop-blur-sm text-white border border-white/30 px-8 py-4 rounded-xl font-bold hover:bg-white/30 transition-all duration-300">
              Join Today
            </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Building className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Estate</h3>
                  <p className="text-gray-400 text-sm">Premium Properties</p>
                </div>
              </div>
              <p className="text-gray-300 mb-6 max-w-md">
                Your trusted partner in real estate since 2003. We help you find the perfect property 
                and maximize your investment potential.
              </p>
              <div className="flex gap-4">
                <button className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center transition-colors">
                  <span className="sr-only">Facebook</span>
                  📘
                </button>
                <button className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center transition-colors">
                  <span className="sr-only">Twitter</span>
                  🐦
                </button>
                <button className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center transition-colors">
                  <span className="sr-only">LinkedIn</span>
                  💼
                </button>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                {navLinks.map((link) => (
                  <li key={link.name}>
                    <button className="text-gray-300 hover:text-white transition-colors">
                      {link.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-bold mb-4">Contact Us</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-teal-400" />
                  <span className="text-gray-300">+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-teal-400" />
                  <span className="text-gray-300">hello@estate.com</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-teal-400" />
                  <span className="text-gray-300">Downtown Financial District</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Estate. All rights reserved. | Privacy Policy | Terms of Service</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
