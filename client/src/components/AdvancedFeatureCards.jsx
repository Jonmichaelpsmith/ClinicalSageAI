import React, { useEffect, useState } from 'react';
import { Database, Globe, Shield, Server, FileText, BarChart, ArrowRight } from 'lucide-react';

// Compact, professional component for features section
const AdvancedFeatureCards = () => {
  const [selectedCard, setSelectedCard] = useState(0);
  const [counter1, setCounter1] = useState(0);
  const [counter2, setCounter2] = useState(0);
  const [counter3, setCounter3] = useState(0);

  const cards = [
    {
      id: 'vision',
      title: 'Industry Vision',
      description: 'Built upon deep understanding of regulatory frameworks and pharmaceutical development processes to address the most critical challenges in global submissions.',
      icon: <Globe className="h-6 w-6 text-blue-400" />,
      color: 'from-blue-900 to-blue-800',
      stats: [
        { label: 'Global Reach', value: '8 Regions', icon: <Globe className="h-4 w-4 text-blue-400" /> },
        { label: 'Success Rate', value: '99.8%', icon: <Shield className="h-4 w-4 text-blue-400" /> }
      ],
      features: [
        'Comprehensive regulatory intelligence',
        'Cross-jurisdictional harmonization',
        '21 CFR Part 11 compliant'
      ]
    },
    {
      id: 'innovation',
      title: 'Data-Backed Innovation',
      description: 'Our AI models are trained on thousands of regulatory documents, clinical study reports, and historical submission data to ensure precise, compliant outputs.',
      icon: <Database className="h-6 w-6 text-indigo-400" />,
      color: 'from-indigo-900 to-indigo-800',
      stats: [
        { label: 'Training Documents', value: '12,500+', icon: <FileText className="h-4 w-4 text-indigo-400" /> },
        { label: 'Analysis Points', value: '75,000+', icon: <BarChart className="h-4 w-4 text-indigo-400" /> }
      ],
      features: [
        'Neural network document validation',
        'Semantic cross-reference analysis',
        'Predictive approval analytics'
      ]
    },
    {
      id: 'architecture',
      title: 'Enterprise Architecture',
      description: 'Secure, scalable infrastructure designed for pharmaceutical and biotech enterprises with comprehensive audit trails and role-based access control.',
      icon: <Server className="h-6 w-6 text-purple-400" />,
      color: 'from-purple-900 to-purple-800',
      stats: [
        { label: 'Security Rating', value: 'HITRUST CSF', icon: <Shield className="h-4 w-4 text-purple-400" /> },
        { label: 'Uptime', value: '99.99%', icon: <Server className="h-4 w-4 text-purple-400" /> }
      ],
      features: [
        'GxP validated environment',
        'Comprehensive audit logging',
        'Role-based access control'
      ]
    }
  ];

  // Animated counters effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCounter1(prev => prev < 95 ? prev + 1 : 95);
      setCounter2(prev => prev < 12500 ? prev + 125 : 12500);
      setCounter3(prev => prev < 99.9 ? prev + 1 : 99.9);
    }, 30);

    return () => clearInterval(interval);
  }, []);

  // Auto-rotate cards
  useEffect(() => {
    const interval = setInterval(() => {
      setSelectedCard(prev => (prev + 1) % cards.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [cards.length]);

  return (
    <section className="py-20 bg-gray-900 text-white relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[url('https://raw.githubusercontent.com/Concepts2Cures/assets/main/dna-pattern.svg')] bg-repeat opacity-30"></div>
      </div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 text-transparent bg-clip-text">
            Enterprise Intelligence Platform
          </h2>
          <p className="text-sm text-blue-200 max-w-2xl mx-auto">
            Advanced computational models transforming regulatory operations across therapeutic domains
          </p>
        </div>
        
        {/* Metrics row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-10">
          <div className="bg-gradient-to-br from-blue-900/50 to-blue-800/50 rounded-md p-4 border border-blue-700/30 shadow-md flex flex-col items-center">
            <div className="text-3xl font-bold text-white mb-1">{counter1}%</div>
            <p className="text-blue-300 text-sm">Compliance Rate</p>
            <div className="mt-2 h-1.5 w-full bg-blue-950 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${counter1}%` }}></div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-indigo-900/50 to-indigo-800/50 rounded-md p-4 border border-indigo-700/30 shadow-md flex flex-col items-center">
            <div className="text-3xl font-bold text-white mb-1">{counter2.toLocaleString()}</div>
            <p className="text-indigo-300 text-sm">Training Documents</p>
            <div className="mt-2 h-1.5 w-full bg-indigo-950 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min(counter2 / 125, 100)}%` }}></div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-900/50 to-purple-800/50 rounded-md p-4 border border-purple-700/30 shadow-md flex flex-col items-center">
            <div className="text-3xl font-bold text-white mb-1">{counter3.toFixed(1)}%</div>
            <p className="text-purple-300 text-sm">Technical Validation</p>
            <div className="mt-2 h-1.5 w-full bg-purple-950 rounded-full overflow-hidden">
              <div className="h-full bg-purple-500 rounded-full" style={{ width: `${counter3}%` }}></div>
            </div>
          </div>
        </div>
        
        {/* Card Navigation */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-gray-800/50 p-1 rounded-lg">
            {cards.map((card, index) => (
              <button
                key={card.id}
                onClick={() => setSelectedCard(index)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  selectedCard === index 
                    ? 'bg-blue-700 text-white' 
                    : 'text-blue-200 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                {card.title}
              </button>
            ))}
          </div>
        </div>
        
        {/* Featured Card */}
        <div className="max-w-4xl mx-auto">
          <div className={`bg-gradient-to-br ${cards[selectedCard].color} rounded-2xl p-8 border border-blue-700/30 shadow-xl`}>
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 bg-blue-800/50 rounded-xl flex items-center justify-center mr-5">
                {cards[selectedCard].icon}
              </div>
              <h3 className="text-3xl font-bold">{cards[selectedCard].title}</h3>
            </div>
            
            <p className="text-xl text-blue-100 mb-8">
              {cards[selectedCard].description}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {cards[selectedCard].stats.map((stat, i) => (
                <div key={i} className="bg-blue-900/30 rounded-xl p-4 border border-blue-700/20">
                  <div className="flex items-center mb-2">
                    {stat.icon}
                    <span className="text-blue-300 ml-2">{stat.label}</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                </div>
              ))}
            </div>
            
            <div className="space-y-3 mb-6">
              {cards[selectedCard].features.map((feature, i) => (
                <div key={i} className="flex items-center">
                  <div className="h-6 w-6 rounded-full bg-blue-800/50 flex items-center justify-center mr-3">
                    <svg className="h-3 w-3 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-blue-100">{feature}</span>
                </div>
              ))}
            </div>
            
            <div className="mt-6">
              <button className="inline-flex items-center text-blue-300 hover:text-white font-medium transition-colors">
                Learn More <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Indicator Dots */}
        <div className="flex justify-center mt-8">
          {cards.map((_, index) => (
            <button
              key={index}
              onClick={() => setSelectedCard(index)}
              className={`h-3 w-3 rounded-full mx-1 ${
                selectedCard === index ? 'bg-blue-500' : 'bg-blue-800/50'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default AdvancedFeatureCards;