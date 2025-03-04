'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Briefcase, Clock, MapPin } from 'lucide-react';
import ApplyForm from '@/components/apply-form';
import { getJob } from '@/actions/get-jobs';
import { Job } from '@/mock/apis';
import { motion, AnimatePresence } from 'framer-motion';

const PRIMARY_COLOR = '#364957';
const SECONDARY_COLOR = '#FF8A00';

interface JobApplicationPageProps {
  params: {
    jobId: string;
  };
}

export default function JobApplicationPage({ params }: JobApplicationPageProps) {
  const { jobId } = params;
  const router = useRouter();
  
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    async function fetchJob() {
      const jobData = await getJob(Number(jobId));
      if (!jobData) {
        router.push('/404');
      } else if (jobData.status === 'Closed') {
        setShowPopup(true);
      } else {
        setJob(jobData);
      }
      setLoading(false);
    }
    fetchJob();
  }, [jobId, router]);

  if (loading) {
    return <div className="container max-w-7xl py-12 text-center">Loading...</div>;
  }

  if (showPopup) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed inset-0 flex items-center justify-center bg-white backdrop-blur-sm"
        >
          <div className="bg-white p-6 rounded-xl shadow-2xl max-w-sm text-center">
            <h2 className="text-2xl font-bold text-red-500">Application Closed</h2>
            <p className="text-primary/80 mt-2">
              We're sorry, but we are no longer accepting applications for this job.
            </p>
            <button
              onClick={() => router.back()} 
              className="mt-4 bg-black text-white px-4 py-2 rounded-lg"
            >
              Go Back
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  if (!job) {
    return (
      <div className="container max-w-7xl py-12 text-center">
        <h2 className="text-3xl font-bold text-primary">Job Not Found</h2>
        <p className="text-primary/70">The job you are looking for does not exist or has been removed.</p>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-orange-95 p-6 shadow-2xl rounded-b-3xl mb-6">
        <div className="container max-w-7xl py-12">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Job details */}
            <div className="space-y-8">
              <div className="border-b-2 pb-8">
                <h1 className="text-4xl font-bold text-[#364957] mb-4">{job.title}</h1>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2 text-primary/80">
                    <Briefcase className="w-5 h-5" />
                    <span>{job.status}</span>
                  </div>
                  <div className="flex items-center gap-2 text-primary/80">
                    <MapPin className="w-5 h-5" />
                    <span>{job.description.type}</span>
                  </div>
                  <div className="flex items-center gap-2 text-primary/80">
                    <Clock className="w-5 h-5" />
                    <span>Full-time</span>
                  </div>
                </div>
              </div>

              {/* Job Description */}
              <div className="prose max-w-none">
                <h2 className="text-2xl font-semibold text-[#364957] mb-4">About the Role</h2>
                <p className="text-primary/80">{job.description.summary}</p>

                <h3 className="text-xl font-semibold text-[#364957] mt-8 mb-4">Requirements</h3>
                <ul className="space-y-2 text-primary/80">
                  {job.description.responsibilities.map((responsibilities, index) => (
                    <li key={index}>• {responsibilities}</li>
                  ))}
                </ul>

                {/* Skills Section */}
                <h3 className="text-xl font-semibold text-[#364957] mt-8 mb-4">Skills Required</h3>
                <ul className="flex flex-wrap gap-2 text-primary/80">
                  {Array.isArray(job.skills) && job.skills.length > 0 ? (
                    job.skills.map((skill, index) => (
                      <li key={index} className="bg-gray-200 px-3 py-1 rounded-lg text-sm">
                        {skill}
                      </li>
                    ))
                  ) : (
                    <p className="text-primary/60">No specific skills mentioned.</p>
                  )}
                </ul>
              </div>
            </div>

            <div className="h-full self-start">
              <ApplyForm jobId={jobId} />
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-7xl py-14 p-8" style={{ borderColor: `${PRIMARY_COLOR}20` }}>
        <h2 className="text-2xl font-bold mb-8  text-center" style={{ color: PRIMARY_COLOR }}>
          Our Hiring Process
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {['Application Review', 'AI Interview', 'Team Interview'].map((step, i) => (
            <div
              key={step}
              className="text-center p-9 rounded-xl"
              style={{
                backgroundColor: `${PRIMARY_COLOR}08`,
                border: `1px solid ${PRIMARY_COLOR}20`,
              }}
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 "
                style={{
                  backgroundColor: `${SECONDARY_COLOR}15`,
                  color: SECONDARY_COLOR,
                }}
              >
                <span className="font-bold">{i + 1}</span>
              </div>
              <h3 className="font-semibold mb-2" style={{ color: PRIMARY_COLOR }}>
                {step}
              </h3>
              <p style={{ color: `${PRIMARY_COLOR}AA` }}>Typically 1-2 business days</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
