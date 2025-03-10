'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Briefcase, Clock, MapPin, Lock, BookOpenText, BrainCircuit, Users, CheckCircle } from 'lucide-react';
import ApplyForm from '@/components/apply-form';
import { getJob,  Job } from '@/actions/get-jobs';
import { motion, AnimatePresence } from 'framer-motion';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const PRIMARY_COLOR = '#364957';
const SECONDARY_COLOR = '#FF8A00';

function parseListItems(htmlString: string) {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    const listItems = Array.from(doc.querySelectorAll('li'));
    
    if (listItems.length > 0) {
      return listItems.map(li => {
        // Extract text from <p> if exists, otherwise use li text
        const p = li.querySelector('p');
        return p ? p.textContent || '' : li.textContent || '';
      });
    }
    
    // Fallback for plain text with newlines
    return htmlString.split('\n').filter(line => line.trim());
  } catch (e) {
    // Fallback for invalid HTML
    return htmlString.split('\n').filter(line => line.trim());
  }
}

export default function JobApplicationPage() {
  const params = useParams();
  const jobId = params?.jobId as string;
  const router = useRouter();

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    async function fetchJob() {
      const jobData = await getJob(jobId);
      if (!jobData) {
        router.push('/404');
      } else if (jobData.job_status === 'Closed') {
        setShowPopup(true);
      } else {
        setJob(jobData);
      }
      setLoading(false);
    }
    fetchJob();
  }, [jobId, router]);

  if (loading) {
    return (
      <div className="container max-w-6xl py-12">
        <Skeleton height={80} className="mb-8" baseColor={`${PRIMARY_COLOR}20`} />
        <div className="grid lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <Skeleton count={5} baseColor={`${PRIMARY_COLOR}20`} />
            <Skeleton height={300} baseColor={`${PRIMARY_COLOR}20`} />
          </div>
          <Skeleton height={600} baseColor={`${PRIMARY_COLOR}20`} />
        </div>
      </div>
    );
  }

  if (showPopup) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed inset-0 flex items-center justify-center bg-white/90 backdrop-blur-sm"
        >
          <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md text-center border border-gray-200">
            <div className="flex justify-center mb-4">
              <Lock className="w-12 h-12 text-red-500" strokeWidth={1.5} />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Application Closed</h2>
            <p className="text-gray-600 mb-6">
              This position is no longer accepting applications. Check back later for new opportunities!
            </p>
            <button
              onClick={() => router.back()} 
              className="w-full bg-[#FF8A00] text-white px-6 py-3 rounded-lg hover:bg-[#E67A00] transition-colors font-medium shadow-sm"
            >
              Explore Other Roles
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  if (!job) {
    return (
      <div className="container max-w-6xl py-24 text-center">
        <h2 className="text-4xl font-bold text-[#364957] mb-4">Opportunity Not Found</h2>
        <p className="text-[#364957]/80 max-w-md mx-auto">
          The position you're looking for has either been filled or is no longer available.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="bg-gradient-to-b from-gray-50 to-white border-b border-gray-100">
        <div className="container max-w-7xl py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid lg:grid-cols-2 gap-12 items-start"
          >
            <div className="space-y-8">
              <div className="space-y-4">
                <button
                  onClick={() => router.back()}
                  className="text-[#364957] hover:text-[#2a3844] flex items-center gap-2 mb-8 font-medium"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
                  Back to Careers
                </button>
                <h1 className="text-4xl font-bold text-[#364957] leading-tight">{job.title}</h1>
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-2 text-[#364957] bg-[#364957]/10 px-4 py-2 rounded-full">
                    <Briefcase className="w-5 h-5" />
                    <span className="text-sm font-medium">{job.job_status.toUpperCase()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#364957] bg-[#364957]/10 px-4 py-2 rounded-full">
                    <MapPin className="w-5 h-5" />
                    <span className="text-sm font-medium">{job.description.type}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#364957] bg-[#364957]/10 px-4 py-2 rounded-full">
                    <Clock className="w-5 h-5" />
                    <span className="text-sm font-medium">{job.description.commitment}</span>
                  </div>
                </div>
              </div>

              <div className="prose max-w-none">
                <h2 className="text-2xl font-semibold text-[#364957] mb-6 flex items-center gap-2">
                  <BookOpenText className="w-6 h-6 text-[#FF8A00]" />
                  About the Role
                </h2>
                <p className="text-[#364957]/90 leading-relaxed">{job.description.summary}</p>

                <h3 className="text-xl font-semibold text-[#364957] mt-12 mb-6 flex items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-[#FF8A00]" />
                  What You'll Do
                </h3>
                <ul className="grid gap-3">
                  {parseListItems(job.description.responsibilities).map((item, index) => (
                    <li key={index} className="flex items-start gap-3 text-[#364957]/90">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF8A00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check-circle w-5 h-5 flex-shrink-0 mt-1">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                        <path d="m9 11 3 3L22 4"/>
                      </svg>
                      <span dangerouslySetInnerHTML={{ __html: item }} />
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="sticky top-24 bg-white rounded-xl shadow-lg border border-[#364957]/20 p-8">
              <ApplyForm jobId={jobId} />
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container max-w-6xl py-16">
        <h2 className="text-3xl font-bold text-[#364957] mb-12 text-center">
          Our Hiring Journey
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: BookOpenText, title: 'Application Review', duration: '1-2 days' },
            { icon: BrainCircuit, title: 'Skills Assessment', duration: '3-5 days' },
            { icon: Users, title: 'Team Interview', duration: '1 week' },
          ].map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-8 rounded-xl border border-[#364957]/20 hover:border-[#FF8A00]/40 transition-all group relative"
            >
              <div className="absolute inset-0 rounded-xl border-2 border-[#FF8A00] opacity-0 group-hover:opacity-20 transition-opacity pointer-events-none"></div>
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-[#FF8A00]/10 flex items-center justify-center mb-6">
                  <step.icon className="w-8 h-8 text-[#FF8A00]" />
                </div>
                <h3 className="text-xl font-semibold text-[#364957] mb-2">{step.title}</h3>
                <p className="text-[#364957]/80 text-sm">{step.duration}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}