import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

// API Configuration
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Auth Context
const AuthContext = React.createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(`${API}/auth/me`);
      setUser(response.data);
    } catch (error) {
      localStorage.removeItem('auth_token');
      delete axios.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const response = await axios.post(`${API}/auth/login`, { email, password });
    const { access_token } = response.data;
    
    localStorage.setItem('auth_token', access_token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
    
    await fetchUserProfile();
    return response.data;
  };

  const register = async (email, password, full_name) => {
    const response = await axios.post(`${API}/auth/register`, {
      email,
      password,
      full_name
    });
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => React.useContext(AuthContext);

// Email Capture Component
const EmailCaptureModal = ({ isOpen, onClose, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    setMessage('');

    try {
      const response = await axios.post(`${API}/email/capture`, {
        email,
        source: 'hero_cta',
        newsletter_consent: true
      });

      setMessage(response.data.message);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    } catch (error) {
      setMessage('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-deep-space border border-neural-blue/30 rounded-2xl p-8 max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <h3 className="text-white text-2xl font-space font-bold mb-2">
            Join the Neural Grid
          </h3>
          <p className="text-gray-300 font-tech">
            Get exclusive access to AI automation insights and quantum processing updates.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full px-4 py-3 bg-black/50 border border-neural-blue/30 rounded-lg text-white placeholder-gray-400 focus:border-neural-blue focus:outline-none"
            required
          />
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-neural-gradient text-white py-3 rounded-lg font-tech font-bold hover:scale-105 transition-all duration-300 disabled:opacity-50"
          >
            {isSubmitting ? 'Activating Neural Grid...' : 'Activate Neural Grid'}
          </button>
        </form>

        {message && (
          <p className="text-center text-neural-green mt-4 font-tech">
            {message}
          </p>
        )}

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

// Payment Component
const PaymentModal = ({ isOpen, onClose, packageId, packageInfo }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();

  const handlePayment = async () => {
    if (!user) {
      alert('Please login to purchase');
      return;
    }

    setIsProcessing(true);

    try {
      const response = await axios.post(`${API}/payments/checkout/session`, {
        package_id: packageId,
        payment_type: 'course',
        item_id: packageId
      });

      // Redirect to Stripe Checkout
      window.location.href = response.data.url;
    } catch (error) {
      alert('Payment initialization failed. Please try again.');
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-deep-space border border-neural-blue/30 rounded-2xl p-8 max-w-md w-full mx-4">
        <h3 className="text-white text-2xl font-space font-bold mb-4">
          {packageInfo?.name}
        </h3>
        
        <div className="text-center mb-6">
          <div className="text-neural-blue text-4xl font-bold mb-2">
            ${packageInfo?.price}
          </div>
          <p className="text-gray-300">One-time payment for lifetime access</p>
        </div>

        <button
          onClick={handlePayment}
          disabled={isProcessing || !user}
          className="w-full bg-neural-gradient text-white py-3 rounded-lg font-tech font-bold hover:scale-105 transition-all duration-300 disabled:opacity-50 mb-4"
        >
          {isProcessing ? 'Initializing Payment...' : 'Proceed to Payment'}
        </button>

        {!user && (
          <p className="text-center text-yellow-400 text-sm">
            Please login first to purchase this package
          </p>
        )}

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

// Auth Modal Component
const AuthModal = ({ isOpen, onClose, mode = 'login' }) => {
  const [currentMode, setCurrentMode] = useState(mode);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    try {
      if (currentMode === 'login') {
        await login(formData.email, formData.password);
        setMessage('Login successful!');
        setTimeout(onClose, 1000);
      } else {
        await register(formData.email, formData.password, formData.full_name);
        setMessage('Registration successful! Please login.');
        setCurrentMode('login');
      }
    } catch (error) {
      setMessage(error.response?.data?.detail || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-deep-space border border-neural-blue/30 rounded-2xl p-8 max-w-md w-full mx-4">
        <h3 className="text-white text-2xl font-space font-bold mb-6 text-center">
          {currentMode === 'login' ? 'Neural Access Login' : 'Join Neural Grid'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {currentMode === 'register' && (
            <input
              type="text"
              placeholder="Full Name"
              value={formData.full_name}
              onChange={(e) => setFormData({...formData, full_name: e.target.value})}
              className="w-full px-4 py-3 bg-black/50 border border-neural-blue/30 rounded-lg text-white placeholder-gray-400 focus:border-neural-blue focus:outline-none"
              required
            />
          )}
          
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="w-full px-4 py-3 bg-black/50 border border-neural-blue/30 rounded-lg text-white placeholder-gray-400 focus:border-neural-blue focus:outline-none"
            required
          />
          
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            className="w-full px-4 py-3 bg-black/50 border border-neural-blue/30 rounded-lg text-white placeholder-gray-400 focus:border-neural-blue focus:outline-none"
            required
          />
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-neural-gradient text-white py-3 rounded-lg font-tech font-bold hover:scale-105 transition-all duration-300 disabled:opacity-50"
          >
            {isSubmitting 
              ? (currentMode === 'login' ? 'Accessing...' : 'Creating Account...') 
              : (currentMode === 'login' ? 'Access Neural Grid' : 'Join Neural Grid')
            }
          </button>
        </form>

        {message && (
          <p className={`text-center mt-4 font-tech ${message.includes('successful') ? 'text-neural-green' : 'text-red-400'}`}>
            {message}
          </p>
        )}

        <div className="text-center mt-4">
          <button
            onClick={() => setCurrentMode(currentMode === 'login' ? 'register' : 'login')}
            className="text-neural-blue hover:text-neural-purple transition-colors font-tech"
          >
            {currentMode === 'login' 
              ? "Don't have an account? Join Neural Grid" 
              : "Already have an account? Login"
            }
          </button>
        </div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

// Terminal Effect Component
const TerminalText = ({ text, delay = 0 }) => {
  const [displayText, setDisplayText] = useState('');
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      let i = 0;
      const typeInterval = setInterval(() => {
        if (i < text.length) {
          setDisplayText(text.slice(0, i + 1));
          i++;
        } else {
          clearInterval(typeInterval);
          setShowCursor(false);
        }
      }, 50);

      return () => clearInterval(typeInterval);
    }, delay);

    return () => clearTimeout(timer);
  }, [text, delay]);

  return (
    <span className="font-space">
      {displayText}
      {showCursor && <span className="animate-pulse">|</span>}
    </span>
  );
};

// Animated Neural Network SVG
const NeuralNetwork = () => {
  return (
    <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 800 600">
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {/* Neural connections */}
      <g stroke="#00ffff" strokeWidth="1" fill="none" filter="url(#glow)">
        <path d="M100,100 L300,200 L500,150 L700,250" className="animate-draw" strokeDasharray="1000" strokeDashoffset="1000" />
        <path d="M200,300 L400,100 L600,400 L750,200" className="animate-draw" strokeDasharray="1000" strokeDashoffset="1000" style={{animationDelay: '0.5s'}} />
        <path d="M50,400 L250,300 L450,500 L650,350" className="animate-draw" strokeDasharray="1000" strokeDashoffset="1000" style={{animationDelay: '1s'}} />
      </g>
      
      {/* Neural nodes */}
      <g fill="#00ffff" className="opacity-80">
        <circle cx="100" cy="100" r="4" className="animate-glow" />
        <circle cx="300" cy="200" r="6" className="animate-glow" style={{animationDelay: '0.3s'}} />
        <circle cx="500" cy="150" r="5" className="animate-glow" style={{animationDelay: '0.6s'}} />
        <circle cx="700" cy="250" r="4" className="animate-glow" style={{animationDelay: '0.9s'}} />
        <circle cx="200" cy="300" r="5" className="animate-glow" style={{animationDelay: '1.2s'}} />
        <circle cx="400" cy="100" r="6" className="animate-glow" style={{animationDelay: '1.5s'}} />
      </g>
    </svg>
  );
};

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
    <header className={`fixed top-0 w-full z-50 transition-all duration-500 ${
      isScrolled ? 'bg-deep-space/95 backdrop-blur-md border-b border-neural-blue/20' : 'bg-transparent'
    }`}>
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-neural-gradient rounded-full animate-glow"></div>
            <div className="text-white font-space font-bold text-xl tracking-wider">
              NeuroGrid <span className="text-neural-blue">AI</span>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a href="#platform" className="text-white hover:text-neural-blue transition-colors font-futuristic">
              Platform
            </a>
            <a href="#neural-labs" className="text-white hover:text-neural-blue transition-colors font-futuristic">
              Neural Labs
            </a>
            <a href="#intelligence" className="text-white hover:text-neural-blue transition-colors font-futuristic">
              Intelligence
            </a>
            <a href="#contact" className="text-white hover:text-neural-blue transition-colors font-futuristic">
              Contact
            </a>
          </div>
        </div>
      </nav>
    </header>
  );
};

// Hero Section Component with Cinematic Effects
export const HeroSection = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const handlePrimaryAction = () => {
    if (user) {
      // Redirect to Neural Labs if user is logged in
      window.location.href = '#neural-labs';
    } else {
      setShowEmailModal(true);
    }
  };

  const handleSecondaryAction = () => {
    if (user) {
      // Redirect to consultation booking
      window.location.href = '#consultation';
    } else {
      setShowAuthModal(true);
    }
  };

  return (
    <>
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-deep-space">
        {/* Animated Background */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1647356191320-d7a1f80ca777"
            alt="Neural network cosmos"
            className="w-full h-full object-cover opacity-40 animate-float"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-deep-space/80 via-deep-space/60 to-deep-space/80"></div>
        </div>
        
        {/* Floating Neural Network */}
        <div className="absolute inset-0 z-5">
          <NeuralNetwork />
        </div>
        
        {/* Orbiting Elements */}
        <div className="absolute top-1/4 right-1/4 w-4 h-4 bg-neural-blue rounded-full animate-orbit opacity-60"></div>
        <div className="absolute bottom-1/3 left-1/3 w-6 h-6 bg-neural-pink rounded-full animate-orbit opacity-40" style={{animationDelay: '5s', animationDuration: '25s'}}></div>
        
        {/* Content */}
        <div className="relative z-10 text-center max-w-5xl mx-auto px-6">
          <div className="mb-8">
            {isLoaded && (
              <>
                <div className="text-white text-7xl md:text-8xl font-space font-bold mb-2 animate-fadeInUp">
                  <TerminalText text="NeuroGrid" delay={0} />
                </div>
                <div className="text-neural-blue text-7xl md:text-8xl font-space font-bold animate-fadeInUp">
                  <TerminalText text="AI" delay={1000} />
                </div>
              </>
            )}
          </div>
          
          <div className="mb-8 animate-fadeInUp" style={{animationDelay: '2s'}}>
            <div className="inline-block bg-neural-gradient text-white px-8 py-3 rounded-full text-lg font-futuristic font-bold tracking-wider animate-glow">
              Neural Intelligence • Infinite Possibilities
            </div>
          </div>
          
          <p className="text-gray-300 text-xl mb-12 max-w-3xl mx-auto leading-relaxed font-tech animate-fadeInUp" style={{animationDelay: '2.5s'}}>
            Harness the power of advanced neural networks to transform your business operations. 
            Experience AI that thinks, learns, and evolves with your enterprise.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center animate-fadeInUp" style={{animationDelay: '3s'}}>
            <button 
              onClick={handlePrimaryAction}
              className="bg-neural-gradient text-white px-10 py-4 rounded-lg font-tech font-bold text-lg tracking-wider 
                         hover:scale-105 transition-all duration-300 animate-glow shadow-2xl"
            >
              {user ? 'ACCESS NEURAL LABS' : 'ACTIVATE NEURAL GRID'}
            </button>
            <button 
              onClick={handleSecondaryAction}
              className="border-2 border-neural-blue text-neural-blue px-10 py-4 rounded-lg font-tech font-bold text-lg tracking-wider 
                         hover:bg-neural-blue hover:text-deep-space transition-all duration-300 hover:scale-105 shadow-2xl"
            >
              {user ? 'BOOK CONSULTATION' : 'EXPLORE INTELLIGENCE'}
            </button>
          </div>
        </div>
      </section>
      
      <EmailCaptureModal 
        isOpen={showEmailModal} 
        onClose={() => setShowEmailModal(false)}
        onSuccess={() => console.log('Email captured successfully!')}
      />
      
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </>
  );
};

// Neural Stats Section
export const NeuralStatsSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="bg-deep-space py-20 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <img 
          src="https://images.unsplash.com/photo-1642262798341-50fde182ebf5"
          alt="Neural pattern"
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className={`${isVisible ? 'animate-slideInLeft' : 'opacity-0'}`}>
            <h2 className="text-white text-5xl md:text-6xl font-space font-bold mb-8 leading-tight">
              Neural Networks
              <span className="text-neural-blue block">Reshaping Reality</span>
            </h2>
            <p className="text-gray-300 text-xl leading-relaxed font-tech mb-8">
              Witness the convergence of artificial intelligence and quantum processing power. 
              NeuroGrid AI creates intelligent systems that adapt, evolve, and transcend traditional limitations.
            </p>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-3 h-3 bg-neural-green rounded-full animate-glow"></div>
                <span className="text-neural-green font-futuristic font-bold">QUANTUM PROCESSING ACTIVE</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-3 h-3 bg-neural-blue rounded-full animate-glow"></div>
                <span className="text-neural-blue font-futuristic font-bold">NEURAL PATHWAYS OPTIMIZED</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-3 h-3 bg-neural-pink rounded-full animate-glow"></div>
                <span className="text-neural-pink font-futuristic font-bold">INTELLIGENCE AMPLIFIED</span>
              </div>
            </div>
          </div>
          
          <div className={`relative ${isVisible ? 'animate-slideInRight' : 'opacity-0'}`}>
            <div className="relative">
              <img 
                src="https://images.pexels.com/photos/17484975/pexels-photo-17484975.png"
                alt="Neural brain visualization"
                className="w-full max-w-md mx-auto rounded-2xl animate-float shadow-2xl"
              />
              <div className="absolute inset-0 bg-neural-gradient opacity-20 rounded-2xl animate-glow"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Intelligence Modules Section
export const IntelligenceModules = () => {
  const modules = [
    {
      title: "Quantum Processing",
      description: "Harness quantum-enhanced neural networks that process complex data patterns in microseconds, enabling real-time decision making at unprecedented scale.",
      icon: "⚛️",
      gradient: "from-neural-blue to-neural-purple"
    },
    {
      title: "Adaptive Learning",
      description: "Self-evolving algorithms that continuously optimize performance, learning from every interaction to become more intelligent over time.",
      icon: "🧠",
      gradient: "from-neural-purple to-neural-pink"
    },
    {
      title: "Predictive Analytics",
      description: "Advanced forecasting systems that anticipate market trends, user behavior, and operational needs before they occur.",
      icon: "🔮",
      gradient: "from-neural-pink to-neural-green"
    },
    {
      title: "Neural Automation",
      description: "Intelligent automation that goes beyond rules-based systems, making contextual decisions with human-like reasoning capabilities.",
      icon: "🤖",
      gradient: "from-neural-green to-neural-blue"
    }
  ];

  return (
    <section className="bg-gradient-to-b from-deep-space to-black py-20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-white text-5xl md:text-6xl font-space font-bold mb-8">
            Intelligence <span className="text-neural-blue">Modules</span>
          </h2>
          <p className="text-gray-300 text-xl max-w-4xl mx-auto font-tech leading-relaxed">
            Modular AI systems designed to integrate seamlessly with your existing infrastructure, 
            providing specialized intelligence for every aspect of your operation.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {modules.map((module, index) => (
            <div key={index} className="group cursor-pointer">
              <div className={`bg-gradient-to-br ${module.gradient} p-1 rounded-2xl hover:scale-105 transition-all duration-300`}>
                <div className="bg-deep-space p-8 rounded-2xl h-full hover:bg-black/90 transition-colors">
                  <div className="text-6xl mb-6 animate-float" style={{animationDelay: `${index * 0.2}s`}}>
                    {module.icon}
                  </div>
                  <h3 className="text-white text-2xl font-futuristic font-bold mb-6">{module.title}</h3>
                  <p className="text-gray-300 leading-relaxed font-tech">{module.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

# Neural Labs Section
export const NeuralLabsSection = () => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const { user } = useAuth();

  const labs = [
    {
      id: 'starter',
      title: "Neural Starter Package",
      price: 99,
      description: "Master neural architectures and quantum AI principles through immersive training.",
      image: "https://images.unsplash.com/photo-1520509414578-d9cbf09933a1",
      tech: "Python • TensorFlow • PyTorch",
      features: [
        "Basic AI Automation Course",
        "5 Neural Network Templates", 
        "Community Access",
        "Email Support"
      ]
    },
    {
      id: 'professional',
      title: "Neural Professional Package", 
      price: 299,
      description: "Advanced guidance from neural network specialists for enterprise transformation.",
      image: "https://images.unsplash.com/photo-1728995025396-b5141e209455",
      tech: "Strategy • Architecture • Implementation",
      features: [
        "Complete AI Automation Suite",
        "20+ Neural Network Templates",
        "1-on-1 Mentorship (2 sessions)",
        "Priority Support",
        "Advanced Workshops"
      ]
    },
    {
      id: 'enterprise',
      title: "Neural Enterprise Package",
      price: 599,
      description: "Complete neural intelligence transformation with unlimited access.",
      image: "https://images.unsplash.com/photo-1615223424613-76b8ca0cfdb2",
      tech: "Full Stack • APIs • Frameworks",
      features: [
        "Full Neural Labs Access",
        "Unlimited Templates & Resources",
        "Weekly 1-on-1 Mentorship",
        "Custom AI Development",
        "24/7 Priority Support",
        "Enterprise Integration"
      ]
    }
  ];

  const handlePackageSelect = (packageData) => {
    if (!user) {
      alert('Please login to purchase a package');
      return;
    }
    setSelectedPackage(packageData);
    setShowPaymentModal(true);
  };

  return (
    <>
      <section id="neural-labs" className="bg-black py-20 relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="w-full h-full bg-neural-gradient"></div>
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-white text-5xl md:text-6xl font-space font-bold mb-8">
              Neural <span className="text-neural-blue">Labs</span>
            </h2>
            <p className="text-gray-300 text-xl max-w-4xl mx-auto font-tech leading-relaxed">
              Advanced research facilities where cutting-edge AI technologies are developed, 
              tested, and refined for real-world applications.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-10">
            {labs.map((lab, index) => (
              <div key={index} className="group cursor-pointer">
                <div className="bg-deep-space/80 rounded-2xl overflow-hidden hover:bg-deep-space transition-all duration-500 border border-neural-blue/20 hover:border-neural-blue/50">
                  <div className="h-64 overflow-hidden relative">
                    <img 
                      src={lab.image}
                      alt={lab.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-neural-gradient opacity-20 group-hover:opacity-40 transition-opacity"></div>
                    
                    {/* Price Badge */}
                    <div className="absolute top-4 right-4 bg-neural-gradient text-white px-4 py-2 rounded-full font-bold">
                      ${lab.price}
                    </div>
                  </div>
                  
                  <div className="p-8">
                    <div className="text-neural-blue text-sm font-futuristic font-bold mb-3 tracking-wider">
                      {lab.tech}
                    </div>
                    <h3 className="text-white text-2xl font-space font-bold mb-4">{lab.title}</h3>
                    <p className="text-gray-300 leading-relaxed font-tech mb-6">{lab.description}</p>
                    
                    {/* Features List */}
                    <ul className="space-y-2 mb-6">
                      {lab.features.map((feature, idx) => (
                        <li key={idx} className="text-gray-400 text-sm flex items-center">
                          <span className="text-neural-green mr-2">✓</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    
                    <button
                      onClick={() => handlePackageSelect(lab)}
                      className="w-full bg-neural-gradient text-white py-3 rounded-lg font-tech font-bold hover:scale-105 transition-all duration-300 shadow-lg"
                    >
                      {user ? 'Purchase Package' : 'Login to Purchase'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-16">
            <div className="bg-deep-space/50 border border-neural-blue/30 rounded-2xl p-8 max-w-2xl mx-auto">
              <h3 className="text-white text-2xl font-space font-bold mb-4">
                Not sure which package is right for you?
              </h3>
              <p className="text-gray-300 mb-6 font-tech">
                Book a free consultation with our neural intelligence specialists to find the perfect fit.
              </p>
              <button className="bg-transparent border-2 border-neural-blue text-neural-blue px-8 py-3 rounded-lg font-tech font-bold hover:bg-neural-blue hover:text-deep-space transition-all duration-300">
                Schedule Free Consultation
              </button>
            </div>
          </div>
        </div>
      </section>
      
      <PaymentModal 
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        packageId={selectedPackage?.id}
        packageInfo={selectedPackage}
      />
    </>
  );
};

// CTA Section with Advanced Effects
export const CTASection = () => {
  return (
    <section className="bg-gradient-to-r from-deep-space via-black to-deep-space py-20 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-32 h-32 bg-neural-blue/10 rounded-full animate-float"></div>
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-neural-purple/10 rounded-full animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-neural-pink/5 rounded-full animate-float" style={{animationDelay: '4s'}}></div>
      </div>
      
      <div className="container mx-auto px-6 text-center relative z-10">
        <h2 className="text-white text-5xl md:text-6xl font-space font-bold mb-8 leading-tight">
          Ready to Enter the
          <span className="text-neural-blue block">Neural Grid?</span>
        </h2>
        <p className="text-gray-300 text-xl mb-12 max-w-3xl mx-auto font-tech leading-relaxed">
          Join the next evolution of artificial intelligence. Transform your business with 
          neural networks that think, adapt, and evolve beyond traditional AI limitations.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
          <button className="bg-neural-gradient text-white px-12 py-5 rounded-lg font-tech font-bold text-xl tracking-wider 
                           hover:scale-105 transition-all duration-300 animate-glow shadow-2xl">
            INITIALIZE NEURAL GRID
          </button>
          <button className="border-2 border-neural-blue text-neural-blue px-12 py-5 rounded-lg font-tech font-bold text-xl tracking-wider 
                           hover:bg-neural-blue hover:text-deep-space transition-all duration-300 hover:scale-105 shadow-2xl">
            SCHEDULE CONSULTATION
          </button>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="text-center bg-deep-space/50 p-8 rounded-2xl border border-neural-blue/20">
            <div className="text-neural-blue text-4xl font-space font-bold mb-3">∞</div>
            <div className="text-gray-300 font-futuristic">Unlimited Neural Processing Power</div>
          </div>
          <div className="text-center bg-deep-space/50 p-8 rounded-2xl border border-neural-purple/20">
            <div className="text-neural-purple text-4xl font-space font-bold mb-3">⚡</div>
            <div className="text-gray-300 font-futuristic">Quantum-Speed Intelligence</div>
          </div>
          <div className="text-center bg-deep-space/50 p-8 rounded-2xl border border-neural-pink/20">
            <div className="text-neural-pink text-4xl font-space font-bold mb-3">🚀</div>
            <div className="text-gray-300 font-futuristic">Future-Ready AI Solutions</div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Enhanced Footer
export const Footer = () => {
  return (
    <footer className="bg-deep-space py-16 border-t border-neural-blue/20">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12">
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-neural-gradient rounded-full animate-glow"></div>
              <div className="text-white font-space font-bold text-2xl">
                NeuroGrid <span className="text-neural-blue">AI</span>
              </div>
            </div>
            <p className="text-gray-400 font-tech leading-relaxed">
              Pioneering the future of artificial intelligence through advanced neural networks 
              and quantum processing technologies.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-futuristic font-bold mb-6 text-lg">Neural Platform</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-400 hover:text-neural-blue transition-colors font-tech">Deep Learning Academy</a></li>
              <li><a href="#" className="text-gray-400 hover:text-neural-blue transition-colors font-tech">AI Strategy Consulting</a></li>
              <li><a href="#" className="text-gray-400 hover:text-neural-blue transition-colors font-tech">Neural Code Repository</a></li>
              <li><a href="#" className="text-gray-400 hover:text-neural-blue transition-colors font-tech">Quantum Certification</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-futuristic font-bold mb-6 text-lg">Intelligence</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-400 hover:text-neural-blue transition-colors font-tech">Neural Networks</a></li>
              <li><a href="#" className="text-gray-400 hover:text-neural-blue transition-colors font-tech">Quantum Processing</a></li>
              <li><a href="#" className="text-gray-400 hover:text-neural-blue transition-colors font-tech">Adaptive Learning</a></li>
              <li><a href="#" className="text-gray-400 hover:text-neural-blue transition-colors font-tech">Predictive Analytics</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-futuristic font-bold mb-6 text-lg">Neural Network</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-400 hover:text-neural-blue transition-colors font-tech">Neural Grid</a></li>
              <li><a href="#" className="text-gray-400 hover:text-neural-blue transition-colors font-tech">AI Community</a></li>
              <li><a href="#" className="text-gray-400 hover:text-neural-blue transition-colors font-tech">Research Papers</a></li>
              <li><a href="#" className="text-gray-400 hover:text-neural-blue transition-colors font-tech">Quantum Support</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-neural-blue/20 mt-12 pt-8 text-center">
          <p className="text-gray-400 font-tech">
            © 2025 NeuroGrid AI. All rights reserved. • Neural Intelligence • Quantum Processing • Future Ready
          </p>
        </div>
      </div>
    </footer>
  );
};