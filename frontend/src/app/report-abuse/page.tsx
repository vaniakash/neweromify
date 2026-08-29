"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { AlertOctagon, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ReportAbusePage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    incidentType: '',
    urlOrId: '',
    description: ''
  });

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [responseMessage, setResponseMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    // Simulating API call for abuse report
    setTimeout(() => {
      setStatus('success');
      setResponseMessage('Your report has been submitted successfully. Our Trust & Safety team will review it immediately.');
      setFormData({ name: '', email: '', incidentType: '', urlOrId: '', description: '' });
    }, 1500);
  };

  return (
    <div className="bg-slate-50 min-h-screen font-sans">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-red-200 p-8 sm:p-12 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-red-600"></div>
          
          <div className="text-center mb-10">
            <div className="flex justify-center mb-4">
              <div className="bg-red-100 p-4 rounded-full">
                <AlertOctagon className="h-10 w-10 text-red-600" />
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
              Report Abuse or NCII
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              We take safety violations incredibly seriously. If you have encountered Non-Consensual Intimate Imagery (NCII), deepfakes of real people, child exploitation material, or any other severe violation of our Acceptable Use Policy, please report it immediately.
            </p>
          </div>

          <div className="max-w-2xl mx-auto bg-slate-50 p-6 sm:p-8 rounded-xl border border-slate-200">
            {status === 'success' ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center">
                <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-emerald-900 mb-2">Report Submitted</h3>
                <p className="text-emerald-700 text-sm mb-6">{responseMessage}</p>
                <Button 
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() => setStatus('idle')}
                >
                  Submit Another Report
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {status === 'error' && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <p>{responseMessage}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">Your Name (Optional)</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all"
                      placeholder="Jane Doe"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all"
                      placeholder="For follow-up"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="incidentType" className="block text-sm font-medium text-slate-700 mb-1">Incident Type</label>
                  <select
                    id="incidentType"
                    name="incidentType"
                    value={formData.incidentType}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all"
                  >
                    <option value="" disabled>Select the type of violation</option>
                    <option value="ncii">Non-Consensual Intimate Imagery (NCII)</option>
                    <option value="deepfake">Deepfake of a Real Person</option>
                    <option value="minors">Content Involving Minors</option>
                    <option value="harassment">Harassment or Bullying</option>
                    <option value="other">Other Severe Violation</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="urlOrId" className="block text-sm font-medium text-slate-700 mb-1">Link or User ID of Offender</label>
                  <input
                    type="text"
                    id="urlOrId"
                    name="urlOrId"
                    value={formData.urlOrId}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all"
                    placeholder="https://... or User ID"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">Description & Evidence</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all resize-none"
                    placeholder="Please provide as much detail as possible to help us investigate quickly."
                  ></textarea>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    className="w-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-2"
                    disabled={status === 'loading'}
                  >
                    {status === 'loading' ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting...
                      </span>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Submit Report
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-center text-slate-500 mt-4">
                    By submitting this form, you acknowledge that your report will be investigated in accordance with our <Link href="/privacy" className="underline">Privacy Policy</Link> and <Link href="/acceptable-use" className="underline">Acceptable Use Policy</Link>.
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
