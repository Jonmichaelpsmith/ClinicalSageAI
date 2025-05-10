// /client/src/components/HeroLandingHeader.jsx
import { Button } from "@/components/ui/button";
import { Link } from 'wouter';

export default function HeroLandingHeader() {
  return (
    <section className="bg-gradient-to-b from-white to-blue-50 py-20 px-6 text-center border-b border-gray-200">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
          AI-Powered Clinical Intelligence, <br className="hidden md:block" />
          Built from Global Clinical Study Reports
        </h1>

        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          LumenTrialGuide.AI delivers study design, IND support, risk forecasting, and protocol intelligence—
          personalized to your role, powered by 3,000+ real-world trials.
        </p>

        <div className="flex flex-col md:flex-row justify-center gap-4">
          <Link href="/example-reports">
            <Button size="lg">
              📂 See a Real Report
            </Button>
          </Link>
          <Link href="/planning?persona=ceo&study_id=demo_ceo">
            <Button variant="outline" size="lg">
              ⚙️ Try It for Your Trial
            </Button>
          </Link>
        </div>

        <p className="text-xs text-muted-foreground mt-4">
          Trusted by biotech leaders, investigators, and regulatory strategists.
        </p>
      </div>
    </section>
  );
}