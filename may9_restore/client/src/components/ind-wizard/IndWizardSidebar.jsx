// /client/src/components/ind-wizard/IndWizardSidebar.jsx

import { Link } from 'wouter'; // or 'react-router-dom' depending on your router setup

export default function IndWizardSidebar() {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">IND Wizard Steps</h2>
      <ul className="space-y-2 text-sm">
        <li>
          <Link href="/module-1" className="text-blue-600 hover:underline">
            Step 1: Initial Planning & Pre-IND
          </Link>
        </li>
        <li>
          <Link href="/module-2" className="text-blue-600 hover:underline">
            Step 2: Nonclinical Data Collection
          </Link>
        </li>
        <li>
          <Link href="/module-3" className="text-blue-600 hover:underline">
            Step 3: CMC Data
          </Link>
        </li>
        <li>
          <Link href="/module-4" className="text-blue-600 hover:underline">
            Step 4: Clinical Protocol
          </Link>
        </li>
        <li>
          <Link href="/module-5" className="text-blue-600 hover:underline">
            Step 5: Investigator Brochure
          </Link>
        </li>
        <li>
          <Link href="/module-5" className="text-blue-600 hover:underline">
            Step 6: FDA Forms
          </Link>
        </li>
        <li>
          <Link href="/module-5" className="text-blue-600 hover:underline">
            Step 7: Final Assembly & Submission
          </Link>
        </li>
      </ul>
    </div>
  );
}