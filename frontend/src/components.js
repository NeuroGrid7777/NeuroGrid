import React, { useState, useEffect, useRef } from 'react';

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

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
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
          <button className="bg-neural-gradient text-white px-10 py-4 rounded-lg font-tech font-bold text-lg tracking-wider 
                           hover:scale-105 transition-all duration-300 animate-glow shadow-2xl">
            ACTIVATE NEURAL GRID
          </button>
          <button className="border-2 border-neural-blue text-neural-blue px-10 py-4 rounded-lg font-tech font-bold text-lg tracking-wider 
                           hover:bg-neural-blue hover:text-deep-space transition-all duration-300 hover:scale-105 shadow-2xl">
            EXPLORE INTELLIGENCE
          </button>
        </div>
      </div>
    </section>
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

// Neural Labs Section
export const NeuralLabsSection = () => {
  const labs = [
    {
      title: "Deep Learning Academy",
      description: "Master advanced neural architectures and quantum AI principles through immersive, hands-on training programs.",
      image: "https://images.unsplash.com/photo-1520509414578-d9cbf09933a1",
      tech: "Python • TensorFlow • PyTorch"
    },
    {
      title: "AI Strategy Consulting", 
      description: "One-on-one guidance from neural network specialists to architect your AI transformation roadmap.",
      image: "https://images.unsplash.com/photo-1728995025396-b5141e209455",
      tech: "Strategy • Architecture • Implementation"
    },
    {
      title: "Neural Code Repository",
      description: "Access cutting-edge AI models, pre-trained networks, and deployment-ready neural architectures.",
      image: "https://images.unsplash.com/photo-1615223424613-76b8ca0cfdb2",
      tech: "Models • APIs • Frameworks"
    }
  ];

  return (
    <section className="bg-black py-20 relative">
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
                </div>
                <div className="p-8">
                  <div className="text-neural-blue text-sm font-futuristic font-bold mb-3 tracking-wider">
                    {lab.tech}
                  </div>
                  <h3 className="text-white text-2xl font-space font-bold mb-4">{lab.title}</h3>
                  <p className="text-gray-300 leading-relaxed font-tech">{lab.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-16">
          <button className="bg-neural-gradient text-white px-12 py-4 rounded-lg font-tech font-bold text-lg tracking-wider 
                           hover:scale-105 transition-all duration-300 animate-glow shadow-2xl">
            ACCESS NEURAL LABS
          </button>
        </div>
      </div>
    </section>
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