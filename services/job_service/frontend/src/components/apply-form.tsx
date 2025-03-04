'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDropzone } from 'react-dropzone';
import { Card } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

const PRIMARY_COLOR = '#364957'; 
const SECONDARY_COLOR = '#FF8A00';
const DISABLED_COLOR = '#A0A0A0'; 

interface ApplyFormProps {
  jobId: string;
}

export default function ApplyForm({ jobId }: ApplyFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    gender: '',
    disability: '',
    experience: '',
    resume: null as File | null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      setFormData({ ...formData, resume: acceptedFiles[0] });
    },
  });

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: [PRIMARY_COLOR, SECONDARY_COLOR, '#ffffff'],
    });
  };

  const isFormValid = () => {
    return (
      formData.name &&
      formData.email &&
      formData.gender &&
      formData.disability &&
      formData.experience &&
      formData.resume
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isFormValid()) {
      setError('Please fill out all required fields.');
      return;
    }

    setLoading(true);

    try {
      const formPayload = new FormData();
      formPayload.append('name', formData.name);
      formPayload.append('email', formData.email);
      formPayload.append('gender', formData.gender);
      formPayload.append('disability', formData.disability);
      formPayload.append('experience', formData.experience);
      if (formData.resume !== null) {
        formPayload.append('resume', formData.resume, formData.resume.name);
      }
        //  api to store the application
      const response = await fetch(`http://localhost:9000/jobs/${jobId}/apply`, {
        method: 'POST',
        body: formPayload,
      });

      if (!response.ok) throw new Error('Application failed');

      setIsSubmitted(true);
      triggerConfetti();

      setTimeout(() => {
        window.location.href = `/`;
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Application failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-8 h-fit sticky top-20 overflow-hidden drop-shadow-2xl">
      <AnimatePresence mode="wait">
        {!isSubmitted ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2" style={{ color: PRIMARY_COLOR }}>
                Apply Here
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Full Name */}
              <div>
                <Label className="text-primary">Full Name</Label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              {/* Email */}
              <div>
                <Label className="text-primary">Email</Label>
                <Input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div>
                <Label className="text-primary">Gender</Label>
                <select
                  className="w-full border border-primary/30 rounded-md px-3 py-2 bg-white text-primary/80"
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  required
                >
                  <option value="" disabled className="text-gray-400">
                    Select your gender
                  </option>
                  <option value="Male">M</option>
                  <option value="Female">F</option>
                </select>
              </div>

              <div>
                <Label className="text-primary">Do you have a disability?</Label>
                <select
                  className="w-full border border-primary/30 rounded-md px-3 py-2 bg-white text-primary/80"
                  value={formData.disability}
                  onChange={(e) => setFormData({ ...formData, disability: e.target.value })}
                  required
                >
                  <option value="" disabled className="text-gray-400">
                    Select an option
                  </option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>

              <div>
                <Label className="text-primary">Years of Experience</Label>
                <select
                  className="w-full border border-primary/30 rounded-md px-3 py-2 bg-white text-primary/80"
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  required
                >
                  <option value="" disabled className="text-gray-400">
                    Select years of experience
                  </option>
                  <option value="0-1">0-1 years</option>
                  <option value="2-3">2-3 years</option>
                  <option value="4-5">4-5 years</option>
                  <option value="6+">6+ years</option>
                </select>
              </div>

              <div>
                <Label className="text-primary">Resume (PDF or DOCX only)</Label>
                <div
                  {...getRootProps()}
                  className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors"
                >
                  <input {...getInputProps()} required />
                  <p className="text-primary/80">
                    {formData.resume ? formData.resume.name : "Drag & drop or click to upload"}
                  </p>
                </div>
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <Button
                type="submit"
                className="w-full transition-colors"
                style={{
                  backgroundColor: isFormValid() ? PRIMARY_COLOR : DISABLED_COLOR,
                  color: 'white',
                  borderColor: isFormValid() ? PRIMARY_COLOR : 'transparent',
                }}
                disabled={!isFormValid() || loading}
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Submit Application'}
              </Button>
            </form>
          </motion.div>
        ) : (
          <p className="text-center text-primary/60">Application Submitted!</p>
        )}
      </AnimatePresence>
    </Card>
  );
}
