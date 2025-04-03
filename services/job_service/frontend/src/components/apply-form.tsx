'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, Loader2, UploadCloud, User, Mail, Venus, Mars, Accessibility, Briefcase, FileText, Phone, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDropzone } from 'react-dropzone';
import { Card } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import ProgressBar from '@/components/ui/progress-bar';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { submitApplication, ApplicationFormData } from '@/actions/get-api';

const PRIMARY_COLOR = '#364957';
const SECONDARY_COLOR = '#FF8A00';
const DISABLED_COLOR = '#E2E8F0';

interface ApplyFormProps {
  jobId: string;
}

const VerifyEmailButton = ({ 
  email,
  onVerified,
  isVerified
}: {
  email: string;
  onVerified: () => void;
  isVerified: boolean;
}) => {
  const [showOtpPopup, setShowOtpPopup] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isValidEmail = (email: string) => /^\S+@\S+\.\S+$/.test(email);

  const handleVerifyClick = async () => {
    setLoading(true);
    try {
      // Simulate API call to send OTP
      await new Promise(resolve => setTimeout(resolve, 1000));
      setShowOtpPopup(true);
    } catch (err) {
      setError('Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async () => {
    setLoading(true);
    try {
      // Simulate API verification
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (otpValue === '123456') { // Replace with actual OTP validation
        onVerified();
        setShowOtpPopup(false);
      } else {
        setError('Invalid OTP code');
      }
    } catch (err) {
      setError('Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button
        type="button"
        className="w-full h-10"
        variant={isVerified ? 'outline' : 'default'}
        style={{
          backgroundColor: isVerified ? 'transparent' : SECONDARY_COLOR,
          borderColor: isVerified ? SECONDARY_COLOR : 'transparent',
        }}
        onClick={!isVerified ? handleVerifyClick : undefined}
        disabled={!isValidEmail(email) || loading || isVerified}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isVerified ? (
          <div className="flex items-center gap-2 text-[#FF8A00]">
            <CheckCircle className="w-4 h-4" />
            Email Verified
          </div>
        ) : (
          'Verify Email Address'
        )}
      </Button>

      <AnimatePresence>
        {showOtpPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="bg-white rounded-xl p-6 max-w-md w-full"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Verify OTP</h3>
                <button 
                  onClick={() => setShowOtpPopup(false)}
                  className="text-[#364957]/50 hover:text-[#364957]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <p className="text-sm text-[#364957]/80 mb-4">
                Enter the 6-digit code sent to {email}
              </p>

              <Input
                value={otpValue}
                onChange={(e) => setOtpValue(e.target.value)}
                placeholder="123456"
                className="mb-4 text-center tracking-[0.5em]"
                maxLength={6}
              />

              {error && (
                <p className="text-red-500 text-sm mb-4">{error}</p>
              )}

              <Button
                onClick={handleOtpSubmit}
                className="w-full"
                disabled={loading || otpValue.length !== 6}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : 'Verify Code'}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function ApplyForm({ jobId }: ApplyFormProps) {
  const [formData, setFormData] = useState<ApplicationFormData>({
    full_name: '',
    email: '',
    phone_number: '',
    gender: '',
    disability: '',
    experience_years: '',
    resume: null,
  });

  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [touchedFields, setTouchedFields] = useState({
    email: false,
    phone_number: false,
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      setFormData({ ...formData, resume: acceptedFiles[0] });
      setUploadProgress(100);
    },
  });

  const isValidEmail = (email: string) => /^\S+@\S+\.\S+$/.test(email);

  const isFormValid = () => {
    return (
      isEmailVerified &&
      formData.full_name &&
      isValidEmail(formData.email) &&
      formData.phone_number &&
      formData.gender &&
      formData.disability &&
      formData.experience_years &&
      formData.resume
    );
  };

  const handlePhoneChange = (value: string) => {
    setFormData({ ...formData, phone_number: value });
    setTouchedFields({ ...touchedFields, phone_number: true });
  };

  useEffect(() => {
    if (isSubmitted) {
      const timer = setTimeout(() => {
        window.location.href = '/';
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isSubmitted]);

  useEffect(() => {
    setIsEmailVerified(false);
  }, [formData.email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isFormValid()) {
      setError('Please fill out all required fields and verify your email.');
      return;
    }

    setLoading(true);
    setUploadProgress(30);

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      await submitApplication(formData, jobId);

      clearInterval(progressInterval);
      setUploadProgress(100);
      setIsSubmitted(true);
      
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: [PRIMARY_COLOR, SECONDARY_COLOR],
        scalar: 1.2
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Application failed');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Card className="p-8 h-fit sticky top-20 border border-[#364957]/20 shadow-2xl">
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
                Apply for the Position
              </h2>
              <p className="text-[#364957]/80">Complete the form below to submit your application</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <Label className="flex items-center gap-2 text-sm font-medium mb-2">
                      <User className="w-4 h-4 text-[#364957]" />
                      Full Name
                    </Label>
                    <Input
                      required
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className="focus:ring-2 focus:ring-[#FF8A00]/50 border-[#364957]/30"
                    />
                  </div>

                  <div>
                    <Label className="flex items-center gap-2 text-sm font-medium mb-2">
                      <Mail className="w-4 h-4 text-[#364957]" />
                      Email Address
                    </Label>
                    <Input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
                        setTouchedFields({ ...touchedFields, email: true });
                      }}
                      className={`focus:ring-2 focus:ring-[#FF8A00]/50 border-[#364957]/30 ${
                        touchedFields.email && !isValidEmail(formData.email) ? 'border-red-500' : ''
                      }`}
                    />
                    {touchedFields.email && !isValidEmail(formData.email) && (
                      <p className="text-xs text-red-500 mt-1">Please enter a valid email address</p>
                    )}
                    
                    <VerifyEmailButton
                      email={formData.email}
                      onVerified={() => setIsEmailVerified(true)}
                      isVerified={isEmailVerified}
                    />
                  </div>

                  <div>
                    <Label className="flex items-center gap-2 text-sm font-medium mb-2">
                      <Phone className="w-4 h-4 text-[#364957]" />
                      Phone Number
                    </Label>
                    <PhoneInput
                      international
                      defaultCountry="ET"
                      value={formData.phone_number}
                      onChange={(value) => handlePhoneChange(value || '')}
                      className={`phone-input ${!formData.phone_number && touchedFields.phone_number ? 'invalid' : ''}`}
                      inputComponent={Input}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm font-medium mb-2">
                      <Venus className="w-4 h-4 text-[#364957]" />
                      Gender
                    </Label>
                    <div className="flex gap-3">
                      <label className="flex-1">
                        <input
                          type="radio"
                          name="gender"
                          value="Female"
                          checked={formData.gender === 'Female'}
                          onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                          className="hidden peer"
                        />
                        <div className="w-full p-3 text-center border border-[#364957]/30 rounded-md peer-checked:border-[#FF8A00] peer-checked:bg-[#FF8A00]/10 transition-all cursor-pointer">
                          <div className="flex items-center justify-center gap-2">
                            <Venus className="w-5 h-5 text-[#364957] peer-checked:text-[#FF8A00]" />
                            <span className="text-sm text-[#364957]">Female</span>
                          </div>
                        </div>
                      </label>
                      
                      <label className="flex-1">
                        <input
                          type="radio"
                          name="gender"
                          value="Male"
                          checked={formData.gender === 'Male'}
                          onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                          className="hidden peer"
                        />
                        <div className="w-full p-3 text-center border border-[#364957]/30 rounded-md peer-checked:border-[#FF8A00] peer-checked:bg-[#FF8A00]/10 transition-all cursor-pointer">
                          <div className="flex items-center justify-center gap-2">
                            <Mars className="w-5 h-5 text-[#364957] peer-checked:text-[#FF8A00]" />
                            <span className="text-sm text-[#364957]">Male</span>
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div>
                    <Label className="flex items-center gap-2 text-sm font-medium mb-2">
                      <Accessibility className="w-4 h-4 text-[#364957]" />
                      Disability Status
                    </Label>
                    <select
                      className="w-full border border-[#364957]/30 rounded-md px-3 py-2.5 bg-white text-[#364957]/90 focus:ring-2 focus:ring-[#FF8A00]/50"
                      value={formData.disability}
                      onChange={(e) => setFormData({ ...formData, disability: e.target.value })}
                      required
                    >
                      <option value="" disabled>Select an option</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>

                  <div>
                    <Label className="flex items-center gap-2 text-sm font-medium mb-2">
                      <Briefcase className="w-4 h-4 text-[#364957]" />
                      Experience
                    </Label>
                    <select
                      className="w-full border border-[#364957]/30 rounded-md px-3 py-2.5 bg-white text-[#364957]/90 focus:ring-2 focus:ring-[#FF8A00]/50"
                      value={formData.experience_years}
                      onChange={(e) => setFormData({ ...formData, experience_years: e.target.value })}
                      required
                    >
                      <option value="" disabled>Select experience</option>
                      <option value="0-1">0-1 years</option>
                      <option value="2-3">2-3 years</option>
                      <option value="4-5">4-5 years</option>
                      <option value="6+">6+ years</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <Label className="flex items-center gap-2 text-sm font-medium mb-2">
                  <FileText className="w-4 h-4 text-[#364957]" />
                  Resume Upload
                </Label>
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                    isDragActive ? 'border-[#FF8A00] bg-[#FF8A00]/10' : 'border-[#364957]/30'
                  }`}
                >
                  <input {...getInputProps()} required />
                  <div className="flex flex-col items-center gap-3">
                    <UploadCloud className={`w-8 h-8 ${isDragActive ? 'text-[#FF8A00]' : 'text-[#364957]/50'}`} />
                    <p className={`text-sm ${
                      isDragActive ? 'text-[#FF8A00]' : 'text-[#364957]/70'
                    }`}>
                      {formData.resume ? (
                        <span className="font-medium text-[#364957]">
                          {formData.resume.name}
                        </span>
                      ) : (
                        <>
                          Drag & drop or <span className="text-[#FF8A00]">browse files</span>
                        </>
                      )}
                    </p>
                    <p className="text-xs text-[#364957]/50">PDF or DOCX (Max 5MB)</p>
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div className="space-y-4">
                {loading && (
                  <ProgressBar
                    value={uploadProgress}
                    color={SECONDARY_COLOR}
                    className="h-2 rounded-full"
                  />
                )}

                <Button
                  type="submit"
                  className="w-full h-12 transition-all font-medium rounded-lg"
                  style={{
                    backgroundColor: isFormValid() ? SECONDARY_COLOR : DISABLED_COLOR,
                    color: isFormValid() ? 'white' : '#64748B',
                  }}
                  disabled={!isFormValid() || loading}
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : 'Submit Application'}
                </Button>
              </div>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center p-8 text-center"
          >
            <CheckCircle className="w-16 h-16 text-green-500 mb-4" strokeWidth={1.5} />
            <h3 className="text-2xl font-bold text-[#364957] mb-2">Application Submitted!</h3>
            <p className="text-[#364957]/80 mb-6">
              Thank you for applying. We'll review your application and get back to you soon.
            </p>
            <div className="w-full max-w-xs">
              <ProgressBar
                value={100}
                color={SECONDARY_COLOR}
                className="h-2 rounded-full mb-4"
              />
              <p className="text-sm text-[#364957]/60">
                Redirecting to homepage in 3 seconds...
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}