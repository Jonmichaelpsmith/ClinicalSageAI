// /client/src/modules/Module1AdminPage.jsx

import { useState } from 'react';
import SponsorInfoForm from '../components/ind-wizard/SponsorInfoForm';
import FDAFormsUploader from '../components/ind-wizard/FDAFormsUploader';
import CoverLetterUploader from '../components/ind-wizard/CoverLetterUploader';
import InvestigatorBrochureUploader from '../components/ind-wizard/InvestigatorBrochureUploader';
import USAgentForm from '../components/ind-wizard/USAgentForm';
import UploadStatusTracker from '../components/ind-wizard/UploadStatusTracker';
import Module1NextButton from '../components/ind-wizard/Module1NextButton';

export default function Module1AdminPage() {
  const [formStatus, setFormStatus] = useState({
    sponsorInfo: false,
    form1571Uploaded: false,
    form1572Uploaded: false,
    coverLetterUploaded: false,
    ibUploaded: false,
    usAgentInfo: false, // optional unless foreign sponsor
  });

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">

      <h1 className="text-2xl font-bold">CTD Module 1: Administrative Information</h1>
      <p className="text-gray-600">Provide sponsor details and required administrative documents for your IND application.</p>

      <UploadStatusTracker formStatus={formStatus} />

      <div className="space-y-8">
        <SponsorInfoForm setFormStatus={setFormStatus} />
        <FDAFormsUploader setFormStatus={setFormStatus} />
        <CoverLetterUploader setFormStatus={setFormStatus} />
        <InvestigatorBrochureUploader setFormStatus={setFormStatus} />
        <USAgentForm setFormStatus={setFormStatus} />
      </div>

      <Module1NextButton formStatus={formStatus} />

    </div>
  );
}