import React from 'react';
import { Link } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';

export default function TermsOfService() {
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
            <h1 className="text-3xl font-bold text-blue-700">Terms of Service</h1>
            <p>Effective Date: April 28, 2025</p>

            <p>Welcome to TrialSage™!</p>
            <p>
              By accessing or using our services, you agree to be bound by these Terms of Service.
              If you do not agree, please do not use our platform.
            </p>

            <h2 className="text-xl font-semibold text-blue-700">1. Services Provided</h2>
            <p>
              TrialSage offers AI-powered regulatory intelligence tools for clinical trial management
              and documentation. Features include IND Wizards, CER Generators, CSR Analyzers, and
              related portals.
            </p>

            <h2 className="text-xl font-semibold text-blue-700">2. User Responsibilities</h2>
            <p>
              You agree to use the platform in compliance with all applicable laws and regulations.
              You must not misuse, hack, or interfere with the service.
            </p>

            <h2 className="text-xl font-semibold text-blue-700">3. Data and Privacy</h2>
            <p>
              All personal data submitted is handled according to our
              <Link href="/privacy" className="underline ml-1">
                Privacy Policy
              </Link>
              . By using TrialSage, you consent to the processing of your data.
            </p>

            <h2 className="text-xl font-semibold text-blue-700">4. Intellectual Property</h2>
            <p>
              All content, trademarks, and software belong to Concept2Cures, Inc. You may not copy,
              modify, or distribute any materials without permission.
            </p>

            <h2 className="text-xl font-semibold text-blue-700">5. Termination</h2>
            <p>We reserve the right to terminate accounts that violate these terms at any time.</p>

            <h2 className="text-xl font-semibold text-blue-700">6. Changes to Terms</h2>
            <p>We may update these Terms from time to time. Updated terms will be posted here.</p>

            <h2 className="text-xl font-semibold text-blue-700">7. Contact Us</h2>
            <p>For questions about these Terms, please contact support@concept2cures.ai.</p>
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
