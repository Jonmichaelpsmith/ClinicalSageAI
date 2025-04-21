// DemoPage.jsx - Demo request page for marketing leads
import React, { useState } from 'react';
import { Link } from 'wouter';
import { ChevronLeft, CheckCircle, Calendar, Clock, User, Building, Mail, Phone } from 'lucide-react';

export default function DemoPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    company: '',
    email: '',
    phone: '',
    role: '',
    teamSize: '',
    interest: [],
    preferredDate: '',
    preferredTime: '',
    message: ''
  });
  
  const [submitted, setSubmitted] = useState(false);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      if (checked) {
        setFormData(prev => ({
          ...prev,
          interest: [...prev.interest, value]
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          interest: prev.interest.filter(item => item !== value)
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Here you would normally submit the form data to your backend
    // For now, we'll just simulate a successful submission
    setTimeout(() => {
      setSubmitted(true);
    }, 1000);
  };
  
  const interestOptions = [
    { id: 'ind', label: 'IND Automation' },
    { id: 'csr', label: 'CSR Intelligence' },
    { id: 'cer', label: 'CER Generator' },
    { id: 'protocol', label: 'Protocol Optimizer' },
    { id: 'submission', label: 'eCTD Submission' }
  ];
  
  const roleOptions = [
    'Regulatory Affairs',
    'Clinical Operations',
    'Medical Writing',
    'Executive',
    'IT/Technology',
    'Other'
  ];
  
  const teamSizeOptions = [
    '1-5',
    '6-20',
    '21-100',
    '101-500',
    '500+'
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="container mx-auto px-6 py-12">
        <div className="mb-8">
          <Link href="/" className="text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
            <ChevronLeft size={16} />
            Back to Home
          </Link>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">
            Request a Demo
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Experience a personalized walkthrough of TrialSage with one of our product specialists.
          </p>
          
          {submitted ? (
            <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg p-8 text-center">
              <div className="inline-block p-3 bg-emerald-100 dark:bg-emerald-900/20 rounded-full mb-4">
                <CheckCircle size={48} className="text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Thanks for your interest!</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                We've received your demo request and will contact you within 24 hours to schedule your personalized demo.
              </p>
              <Link href="/" className="inline-block px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
                Return to Home
              </Link>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg p-6">
              <form onSubmit={handleSubmit}>
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 mb-2">
                      <User size={16} className="inline mr-1" />
                      First Name*
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-slate-700"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 mb-2">
                      Last Name*
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-slate-700"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 mb-2">
                      <Building size={16} className="inline mr-1" />
                      Company*
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      required
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-slate-700"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 mb-2">
                      <Mail size={16} className="inline mr-1" />
                      Work Email*
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-slate-700"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 mb-2">
                      <Phone size={16} className="inline mr-1" />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-slate-700"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 mb-2">
                      Role*
                    </label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      required
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-slate-700"
                    >
                      <option value="">Select your role</option>
                      {roleOptions.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 mb-2">
                      Team Size
                    </label>
                    <select
                      name="teamSize"
                      value={formData.teamSize}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-slate-700"
                    >
                      <option value="">Select team size</option>
                      {teamSizeOptions.map(size => (
                        <option key={size} value={size}>{size}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-gray-700 dark:text-gray-300 mb-2">
                      Areas of Interest*
                    </label>
                    <div className="grid md:grid-cols-3 gap-2">
                      {interestOptions.map(option => (
                        <div key={option.id} className="flex items-center">
                          <input
                            type="checkbox"
                            id={option.id}
                            name="interest"
                            value={option.id}
                            checked={formData.interest.includes(option.id)}
                            onChange={handleChange}
                            className="mr-2"
                          />
                          <label htmlFor={option.id} className="text-gray-700 dark:text-gray-300">
                            {option.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 mb-2">
                      <Calendar size={16} className="inline mr-1" />
                      Preferred Date
                    </label>
                    <input
                      type="date"
                      name="preferredDate"
                      value={formData.preferredDate}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-slate-700"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 mb-2">
                      <Clock size={16} className="inline mr-1" />
                      Preferred Time
                    </label>
                    <select
                      name="preferredTime"
                      value={formData.preferredTime}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-slate-700"
                    >
                      <option value="">Select time</option>
                      <option value="morning">Morning (9am - 12pm)</option>
                      <option value="afternoon">Afternoon (12pm - 4pm)</option>
                      <option value="evening">Evening (4pm - 6pm)</option>
                    </select>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-gray-700 dark:text-gray-300 mb-2">
                      Additional Information
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows="4"
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-slate-700"
                      placeholder="Tell us about your specific needs or questions..."
                    ></textarea>
                  </div>
                </div>
                
                <div className="mb-6">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    By submitting this form, you agree to our privacy policy and terms of service.
                    Fields marked with * are required.
                  </p>
                </div>
                
                <div className="text-center">
                  <button
                    type="submit"
                    className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    Request Demo
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}