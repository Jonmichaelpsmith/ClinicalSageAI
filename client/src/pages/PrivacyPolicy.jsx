import React from 'react';
import { Link } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';

export default function PrivacyPolicy() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-white">
        <div className="container mx-auto flex items-center justify-between p-4">
          <Link href="/" className="flex items-center gap-2">
            <img src="/img/trialsage-logo.svg" alt="TrialSage Logo" className="h-10" />
          </Link>
          <nav className="flex gap-4 text-sm">
            <Link href="/" className="hover:underline">
              Home
            </Link>
            <Link href="/client-portal" className="hover:underline">
              Client Portal
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto p-6">
        <Card>
          <CardContent className="space-y-4">
            <h1 className="text-3xl font-bold text-blue-700">Privacy Policy</h1>
            <p>Effective Date: April 28, 2025</p>
            <p>Your privacy is important to us at TrialSage™.</p>

            <h2 className="text-xl font-semibold text-blue-700">1. Information We Collect</h2>
            <p>
              We collect only the necessary information to provide regulatory intelligence services,
              such as login information, organization details, and usage analytics.
            </p>

            <h2 className="text-xl font-semibold text-blue-700">2. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>To provide and operate the TrialSage services</li>
              <li>To improve user experience</li>
              <li>To respond to customer support requests</li>
              <li>To comply with legal obligations</li>
            </ul>

            <h2 className="text-xl font-semibold text-blue-700">3. Data Sharing</h2>
            <p>
              We do not sell or rent your personal information. We may share information with trusted
              service providers who assist us.
            </p>

            <h2 className="text-xl font-semibold text-blue-700">4. Security</h2>
            <p>
              We implement measures to protect your data, including encrypted storage and secure
              authentication.
            </p>

            <h2 className="text-xl font-semibold text-blue-700">5. Your Rights</h2>
            <p>You have the right to access, correct, or delete your personal information.</p>

            <h2 className="text-xl font-semibold text-blue-700">6. Changes to This Policy</h2>
            <p>We may revise this Privacy Policy. Updates will be posted on this page.</p>

            <h2 className="text-xl font-semibold text-blue-700">7. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, contact
              <a href="mailto:support@concept2cures.ai" className="ml-1 underline">support@concept2cures.ai</a>.
            </p>
          </CardContent>
        </Card>
      </main>

      <footer className="border-t bg-gray-50 py-6">
        <div className="container mx-auto flex flex-col items-center gap-2 text-sm">
          <div className="flex gap-4">
            <Link href="/terms" className="text-blue-700 hover:underline">
              Terms of Service
            </Link>
            <Link href="/privacy" className="text-blue-700 hover:underline">
              Privacy Policy
            </Link>
            <a href="mailto:support@concept2cures.ai" className="text-blue-700 hover:underline">
              Contact Us
            </a>
          </div>
          <p className="text-gray-600">&copy; 2025 Concept2Cures, Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
