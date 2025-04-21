import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

const features = [
  {
    title: '🧬 Study Design Agent (Beta)',
    description: 'Chat with our flagship AI agent trained on 5,000+ CSR trials to refine your study design, reduce risk, and align with regulatory precedent.',
    action: 'Launch Study Agent',
    path: '/study-design-agent',
    highlight: true
  },
  {
    title: '📄 Structured Extraction',
    description: 'Extract endpoints, populations, outcomes, and safety profiles from CSR PDFs using AI.',
    action: 'Upload a CSR',
    path: '/upload',
  },
  {
    title: '🧠 AI Protocol Generator',
    description: 'Create optimized trial designs based on historical precedent.',
    action: 'Optimize a Protocol',
    path: '/protocol-generator',
  },
  {
    title: '📊 Competitive Benchmarking',
    description: 'Compare your protocol to top CSR-backed trials to find differentiation.',
    action: 'Compare Trials',
    path: '/dashboard',
  },
  {
    title: '📈 Statistical Modeling',
    description: 'Forecast success, identify risks, and simulate virtual trials.',
    action: 'Run Simulation',
    path: '/statistical-modeling',
  },
  {
    title: '🔎 Intelligent Protocol Search',
    description: 'Explore and filter 1,900+ CSR trials with advanced filtering and analysis tools.',
    action: 'Search CSRs',
    path: '/reports',
  },
];

export default function HomeFeatures() {
  return (
    <section className="py-12 px-4 md:px-16 bg-gradient-to-b from-white to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto">
        <div className="flex flex-col items-center space-y-4 mb-10 text-center">
          <div className="inline-block rounded-full bg-blue-100 px-4 py-1.5 text-sm font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
            Powerful CSR Intelligence
          </div>
          <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
            Key Capabilities of TrialSage
          </h2>
          <p className="max-w-2xl text-slate-600 text-lg">
            Transform your clinical trial design with data-driven insights from our comprehensive CSR platform
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <Card 
              key={i} 
              className={`hover:shadow-xl transition border dark:border-slate-700 rounded-xl overflow-hidden
                ${f.highlight 
                  ? 'border-2 border-blue-600 shadow-md bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 dark:border-blue-600/40' 
                  : 'border-slate-200 hover:border-blue-200 dark:hover:border-blue-900/40'}
              `}
            >
              <CardContent className="space-y-4 p-6 pt-5">
                <h3 className={`text-xl font-semibold ${f.highlight ? 'text-blue-700 dark:text-blue-400' : 'text-slate-800 dark:text-white'}`}>
                  {f.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400">{f.description}</p>
                <div className="pt-2">
                  <Link href={f.path}>
                    <Button 
                      size="sm" 
                      className={f.highlight 
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium shadow-sm"
                        : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium"
                      }
                    >
                      {f.action}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}