import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Link } from 'wouter';

export default function SimplifiedLandingPage() {
  return (
    <div className="font-sans text-gray-100 bg-gradient-to-br from-gray-900 via-black to-gray-900">

      {/* Hero with dynamic background animation */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Animated background canvas */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('/assets/particle-bg.svg')] bg-cover bg-center opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-800 via-transparent to-green-600 mix-blend-overlay" />
        </div>
        <Container className="relative z-10 text-center px-6">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold mb-6 leading-tight">
            Collapse 14 Months into 6 Months
          </h1>
          <p className="text-lg sm:text-xl max-w-3xl mx-auto mb-10">
            TrialSage powers AI-driven IND automation, live CSR analytics, automated
            CER creation, and predictive risk modeling in one ultra-modern platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/persona/regops">
              <Button size="lg" className="bg-gradient-to-r from-green-400 to-blue-500 text-black shadow-xl hover:scale-105 transform transition">
                See 6‑Month IND Demo
              </Button>
            </Link>
            <Link to="/walkthroughs">
              <Button size="lg" className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-xl hover:scale-105 transform transition">
                Watch Video Walkthroughs
              </Button>
            </Link>
            <Link to="/persona/founder">
              <Button size="lg" variant="outline" className="border-green-400 text-green-400 hover:bg-green-500 hover:text-black hover:border-transparent shadow-xl">
                Instant ROI Calculator
              </Button>
            </Link>
          </div>
        </Container>
      </section>

      <Separator className="border-gray-700" />

      {/* High-Tech Pain Points Slider */}
      <section className="py-16">
        <Container>
          <h2 className="text-4xl font-bold text-center mb-12">Why Legacy Fails You</h2>
          <ScrollArea className="w-full">
            <div className="flex space-x-8 px-4">
              {[
                { stat: '500+ pages', title: 'Static CSRs', desc: "PDFs nobody reads until it's too late.", icon: '/assets/icons/pdf.svg' },
                { stat: '$1M+', title: 'Consulting Fees', desc: 'Expensive, manual IND preparation.', icon: '/assets/icons/dollar.svg' },
                { stat: '4+ tools', title: 'Tool Silos', desc: 'No data flow, constant context switching.', icon: '/assets/icons/silo.svg' },
                { stat: '2.3x', title: 'Protocol Revisions', desc: 'Guesswork leads to costly amendments.', icon: '/assets/icons/brain.svg' },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="min-w-[280px] bg-gray-800 rounded-lg p-6 shadow-2xl hover:scale-105 transform transition">

                  <div className="flex items-center mb-4">
                    <img src={item.icon} alt="" className="w-8 h-8 mr-3" />
                    <span className="text-3xl font-bold">{item.stat}</span>
                  </div>
                  <h3 className="text-2xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-gray-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Container>
      </section>

      <Separator className="border-gray-700" />

      {/* Core Features with advanced hover effects */}
      <section className="py-20 bg-black">
        <Container>
          <h2 className="text-4xl font-bold text-center mb-16 text-white">One Vision, Four Pillars</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[{
              name: 'IND Architect™',
              subtitle: 'AI-Driven IND & eCTD',
              gradient: 'from-blue-600 to-blue-400',
              icon: '/assets/icons/architect.svg',
              features: ['Modules 1-5 auto-generate', 'Compliance validation', 'FDA ESG integrated']
            },{
              name: 'CSR Oracle™',
              subtitle: 'Live Study Intelligence',
              gradient: 'from-green-600 to-green-400',
              icon: '/assets/icons/oracle.svg',
              features: ['Structured KPI dashboards', 'AE & MoA comparisons', 'AI-driven Q&A']
            },{
              name: 'SmartDocs™',
              subtitle: 'Instant CER & Protocol',
              gradient: 'from-purple-600 to-purple-400',
              icon: '/assets/icons/docs.svg',
              features: ['MDR/IVDR compliance', 'Literature integration', 'Traceable references']
            },{
              name: 'InsightVault™',
              subtitle: 'Predictive Analytics & DMS',
              gradient: 'from-gray-700 to-gray-500',
              icon: '/assets/icons/vault.svg',
              features: ['Version control & tracking', 'Risk dashboards', 'Automated audit logs']
            }].map((mod, idx) => (
              <Link to={`/persona/${
                idx === 0 ? 'regops' : idx === 1 ? 'clinops' : idx === 2 ? 'writer' : 'founder'
              }`} key={idx}>
                <div
                  className={`relative overflow-hidden rounded-xl p-6 bg-gradient-to-br ${mod.gradient} group cursor-pointer`}
                >
                <div className="absolute -inset-0.5 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition duration-500 rounded-xl blur-xl"></div>
                <div className="relative">
                  <img src={mod.icon} alt="" className="w-12 h-12 mb-4" />
                  <h3 className="text-2xl font-extrabold text-white mb-1">{mod.name}</h3>
                  <p className="italic text-gray-200 mb-4">{mod.subtitle}</p>
                  <ul className="text-gray-100 space-y-2">
                    {mod.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <span className="mr-2 text-green-300">•</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 pt-3 border-t border-white/10">
                    <div className="text-white hover:text-blue-300 text-sm flex items-center cursor-pointer">
                      <span>Watch video walkthrough</span>
                      <span className="ml-1">→</span>
                    </div>
                  </div>
                </div>
              </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <Separator className="border-gray-700" />

      {/* ROI Section with 3D card effect */}
      <section className="py-20">
        <Container>
          <h2 className="text-4xl font-bold text-center mb-10">Proven ROI vs. Traditional</h2>
          <div className="flex flex-col space-y-6">
            {[
              ['IND Prep Time', '14 mo', '5–7 mo', '50–64%'],
              ['Protocol Revisions', '2.3/study', '0.9/study', '61%'],
              ['Query Response', '8–12 d', '24–48 h', '↑83%'],
              ['Publishing Cost', '$54K', '$17.5K', '↓68%'],
            ].map((row, idx) => (
              <div
                key={idx}
                className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl p-6 shadow-2xl grid grid-cols-4 items-center"
              >
                <span className="text-white font-medium">{row[0]}</span>
                <span className="text-gray-300">{row[1]}</span>
                <span className="text-green-400 font-semibold">{row[2]}</span>
                <span className="text-green-300 text-right font-bold">{row[3]}</span>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link to="/persona/founder">
              <Button size="lg" className="bg-gradient-to-r from-green-400 to-blue-500 text-black shadow-xl hover:scale-105 transform transition">
                Calculate My ROI
              </Button>
            </Link>
          </div>
        </Container>
      </section>

      <Separator className="border-gray-700" />

      {/* Final CTA with split-screen layout */}
      <section className="relative py-24">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-gray-900 opacity-70"></div>
        <Container className="relative z-10 flex flex-col lg:flex-row items-center justify-between">
          <div className="max-w-xl text-white mb-8 lg:mb-0">
            <h2 className="text-4xl font-bold mb-4 leading-tight">
              Ready to Redefine Clinical Development?
            </h2>
            <p className="text-lg">
              Step into the future today with TrialSage. Transform data into decisions,
              speed up approvals, and lead the next generation of biotech innovation.
            </p>
          </div>
          <Link to="/persona/clinops">
            <Button size="lg" className="bg-gradient-to-r from-blue-500 to-teal-400 text-black shadow-2xl hover:scale-105 transform transition">
              Book Your Strategy Demo
            </Button>
          </Link>
        </Container>
      </section>
    </div>
  );
}