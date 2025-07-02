import React, { useState, useEffect } from 'react';

// Header Navigation Component
export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      isScrolled ? 'bg-black/90 backdrop-blur-sm' : 'bg-transparent'
    }`}>
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="text-white font-bold text-xl">AI Automation</div>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a href="#platform" className="text-white hover:text-orange-400 transition-colors">
              Platform
            </a>
            <a href="#courses" className="text-white hover:text-orange-400 transition-colors">
              Courses
            </a>
            <a href="#about" className="text-white hover:text-orange-400 transition-colors">
              About
            </a>
          </div>
        </div>
      </nav>
    </header>
  );
};

// Hero Section Component
export const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
      {/* Background Earth Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.pexels.com/photos/87651/earth-blue-planet-globe-planet-87651.jpeg"
          alt="Earth from space"
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
        <div className="mb-8">
          <div className="text-white text-6xl md:text-7xl font-light mb-4">
            AI
          </div>
          <div className="text-white text-6xl md:text-7xl font-light">
            Automation
          </div>
        </div>
        
        <div className="mb-8">
          <div className="inline-block bg-orange-500 text-black px-6 py-2 rounded-full text-sm font-medium">
            Imagine. Create. Automate.
          </div>
        </div>
        
        <p className="text-gray-300 text-lg mb-12 max-w-2xl mx-auto leading-relaxed">
          Systems companies adopt to streamline time-intensive tasks and 
          enhance existing processes with AI.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="bg-white text-black px-8 py-3 rounded font-medium hover:bg-gray-100 transition-colors">
            I WANT TO LEARN
          </button>
          <button className="border border-white text-white px-8 py-3 rounded font-medium hover:bg-white hover:text-black transition-colors">
            BUILD FOR ME
          </button>
        </div>
      </div>
    </section>
  );
};

// Stats Section Component
export const StatsSection = () => {
  return (
    <section className="bg-black py-20">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-white text-4xl md:text-5xl font-light mb-6 leading-tight">
              Automate any process,
              <span className="text-orange-400"> implement AI</span>
            </h2>
            <p className="text-gray-400 text-lg leading-relaxed">
              Learn how to use AI for faster workflows, smarter decisions, and 
              scalable growth without losing the human touch.
            </p>
          </div>
          <div className="relative">
            <img 
              src="https://images.pexels.com/photos/87651/earth-blue-planet-globe-planet-87651.jpeg"
              alt="Earth automation"
              className="w-full max-w-md mx-auto rounded-full opacity-80"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

// Business Benefits Section
export const BusinessSection = () => {
  const benefits = [
    {
      title: "AI in Business",
      description: "77% of businesses will run on AI by 2027. 33% already do to streamline operations, drive growth, and outpace competitors.",
      icon: "🏢"
    },
    {
      title: "Repetitive Tasks",
      description: "AI helps you automate scheduling, supply chains, and data entry. You'll learn how to build agents that handle these tasks without previous knowledge.",
      icon: "🔄"
    },
    {
      title: "Data",
      description: "Turn raw data into smart decisions. Use AI to forecast trends, extract insights, and stay ahead of your market. No complex tools required.",
      icon: "📊"
    },
    {
      title: "Content",
      description: "Go beyond basic content generation. AI Automation teaches you how to create systems that build personalized experiences for each user in real time.",
      icon: "📝"
    }
  ];

  return (
    <section className="bg-gray-900 py-20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-white text-4xl md:text-5xl font-light mb-6">
            AI Applications in Business
          </h2>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto">
            AI can be integrated with any aspect of business including daily operations, 
            support, analytics, sales, marketing, and user experience.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <div key={index} className="bg-black/50 p-6 rounded-lg hover:bg-black/70 transition-colors">
              <div className="text-4xl mb-4">{benefit.icon}</div>
              <h3 className="text-white text-xl font-semibold mb-4">{benefit.title}</h3>
              <p className="text-gray-400 leading-relaxed">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Services Section Component
export const ServicesSection = () => {
  const services = [
    {
      title: "AI Automation Course",
      description: "Step-by-step training to master AI automation techniques",
      image: "https://images.unsplash.com/photo-1573164713988-8665fc963095?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1NzZ8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHRlY2hub2xvZ3l8ZW58MHx8fHwxNzUxNDY5MDM1fDA&ixlib=rb-4.1.0&q=85"
    },
    {
      title: "1-on-1 Expert Mentorship", 
      description: "Personal guidance from AI automation specialists",
      image: "https://images.unsplash.com/photo-1573164713712-03790a178651?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1NzZ8MHwxfHNlYXJjaHwyfHxidXNpbmVzcyUyMHRlY2hub2xvZ3l8ZW58MHx8fHwxNzUxNDY5MDM1fDA&ixlib=rb-4.1.0&q=85"
    },
    {
      title: "AI Automation Library",
      description: "Ready-to-use AI automation blueprints and templates",
      image: "https://images.pexels.com/photos/6153354/pexels-photo-6153354.jpeg"
    },
    {
      title: "Networking & Workshops",
      description: "Connect with entrepreneurs and join weekly hands-on workshops",
      image: "https://images.pexels.com/photos/19317897/pexels-photo-19317897.jpeg"
    }
  ];

  return (
    <section className="bg-black py-20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-white text-4xl md:text-5xl font-light mb-6">
            Our Services
          </h2>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto">
            Comprehensive training, mentorship, and resources to help you master AI automation
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <div key={index} className="group cursor-pointer">
              <div className="bg-gray-900 rounded-lg overflow-hidden hover:bg-gray-800 transition-colors">
                <div className="h-48 overflow-hidden">
                  <img 
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-white text-xl font-semibold mb-3">{service.title}</h3>
                  <p className="text-gray-400">{service.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <button className="bg-orange-500 text-black px-8 py-3 rounded font-medium hover:bg-orange-400 transition-colors">
            Get Certification
          </button>
        </div>
      </div>
    </section>
  );
};

// CTA Section Component
export const CTASection = () => {
  return (
    <section className="bg-gray-900 py-20">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-white text-4xl md:text-5xl font-light mb-6">
          Ready to Transform Your Business?
        </h2>
        <p className="text-gray-400 text-lg mb-12 max-w-2xl mx-auto">
          Join thousands of businesses already using AI automation to streamline operations 
          and drive growth. Start your journey today.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="bg-orange-500 text-black px-8 py-4 rounded font-medium hover:bg-orange-400 transition-colors text-lg">
            Start Learning Now
          </button>
          <button className="border border-white text-white px-8 py-4 rounded font-medium hover:bg-white hover:text-black transition-colors text-lg">
            Schedule Consultation
          </button>
        </div>
        
        <div className="mt-12 grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-orange-400 text-3xl font-bold mb-2">77%</div>
            <div className="text-gray-400">of businesses will use AI by 2027</div>
          </div>
          <div className="text-center">
            <div className="text-orange-400 text-3xl font-bold mb-2">33%</div>
            <div className="text-gray-400">already streamline operations with AI</div>
          </div>
          <div className="text-center">
            <div className="text-orange-400 text-3xl font-bold mb-2">97M</div>
            <div className="text-gray-400">people will work in AI industry by 2025</div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Footer Component
export const Footer = () => {
  return (
    <footer className="bg-black py-12">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="text-white font-bold text-xl mb-4">AI Automation</div>
            <p className="text-gray-400">
              Empowering businesses with intelligent automation solutions for the future.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Platform</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Courses</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Mentorship</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Workshops</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Certification</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Resources</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Documentation</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Templates</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Community</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Support</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Connect</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Twitter</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">LinkedIn</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">YouTube</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Discord</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            © 2025 AI Automation. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};