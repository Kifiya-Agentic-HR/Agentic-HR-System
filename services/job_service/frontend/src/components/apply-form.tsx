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
import { submitApplication, ApplicationFormData, OtpAPI } from '@/actions/get-api';

const PRIMARY_COLOR = '#364957';
const SECONDARY_COLOR = '#FF8A00';
const DISABLED_COLOR = '#E2E8F0';

interface ApplyFormProps {
  jobId: string;
}

// New component: VerifyEmailText replaces the button with clickable text
const VerifyEmailText = ({ 
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
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  const isValidEmail = (email: string) => /^\S+@\S+\.\S+$/.test(email);

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleSendOtp = async () => {
    if (!isValidEmail(email)) return;
    setIsSendingOtp(true);
    try {
      await OtpAPI.sendOtp(email);
      setShowOtpPopup(true);
      setResendCooldown(30);
      setError('');
    } catch (err) {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setLoading(true);
    try {
      await OtpAPI.resendOtp(email);
      setResendCooldown(30);
      setError('');
    } catch (err) {
      setError('Failed to resend OTP. Please try again in a moment.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otpValue.length !== 6) return;
    setLoading(true);
    try {
      const result = await OtpAPI.verifyOtp(email, otpValue);
      if (result) {
        onVerified();
        setShowOtpPopup(false);
      } else {
        setError('Invalid OTP code. Try again.');
      }
    } catch {
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative mt-2">
      
      <span 
        onClick={!isVerified ? handleSendOtp : undefined} 
        className={`cursor-pointer text-sm font-medium ${
          isValidEmail(email) && !isVerified ? 'text-[#FF8A00]' : 'text-gray-400'
        } ${isSendingOtp ? 'opacity-70' : ''}`}
      >
        {isVerified ? (
          <span className="flex items-center gap-1">
            <CheckCircle className="w-4 h-4" />
            Email Verified
          </span>
        ) : isSendingOtp ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          'Verify Email'
        )}
      </span>

      <AnimatePresence>
        {showOtpPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
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
              
              <p className="text-sm text-[#364957]/80 mb-2">
                Enter the 6-digit code sent to {email}
              </p>

              {error && (
                <div className="bg-red-100 text-red-700 px-4 py-2 rounded-md mb-4 text-sm">
                  {error}
                </div>
              )}

              <Input
                value={otpValue}
                onChange={(e) => {
                  setOtpValue(e.target.value.replace(/\D/g, '').slice(0, 6));
                  if (error) setError('');
                }}
                placeholder="••••••"
                className="mb-4 text-center tracking-[0.5em] font-mono text-xl"
                maxLength={6}
              />

              <div className="flex justify-between items-center mb-6">
                <button
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0 || loading}
                  className="text-sm text-[#FF8A00] disabled:text-gray-400"
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                </button>
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              </div>

              <Button
                onClick={handleVerifyOtp}
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
    disability: 'Not Provided',
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
      'application/pdf': ['.pdf'], // Only accept PDF files
    },
    maxFiles: 1,
    onDrop: (acceptedFiles, rejectedFiles) => {
      if (rejectedFiles.length > 0) {
        const rejectedFile = rejectedFiles[0];
        if (rejectedFile.file.size > 5 * 1024 * 1024) {
          setError('File size exceeds 5MB. Please upload a smaller file.');
        } else {
          setError('Invalid file type. Only PDF files are allowed.');
        }
        return;
      }

      const file = acceptedFiles[0];
      if (file.size > 5 * 1024 * 1024) {
        setError('File size exceeds 5MB. Please upload a smaller file.');
        return;
      }
  
  
      // If valid, update the form data
      setFormData({ ...formData, resume: acceptedFiles[0] });
      setUploadProgress(100);
      setError(''); 
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
    setLoading(true);
    setUploadProgress(30);
  
    if (!isFormValid()) {
      setError('Please fill out all required fields and verify your email.');
      setLoading(false);
      return;
    }
  
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
        scalar: 1.2,
      });
    } catch (err) {
      console.error('Error caught in handleSubmit:', err);
      setError(err instanceof Error ? err.message : 'Application failed');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };
  return (
    <>
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
                <h2
                  className="text-2xl font-bold mb-2"
                  style={{ color: PRIMARY_COLOR }}
                >
                  Apply for the Position
                </h2>
                <p className="text-[#364957]/80">
                  Complete the form below to submit your application
                </p>
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
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            full_name: e.target.value,
                          })
                        }
                        className="focus:ring-2 focus:ring-[#FF8A00]/50 border-[#364957]/30"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-sm font-medium">
                        <Mail className="w-4 h-4 text-[#364957]" />
                        Email Address
                      </Label>

                      {isValidEmail(formData.email) && (
                        <VerifyEmailText
                          email={formData.email}
                          onVerified={() => setIsEmailVerified(true)}
                          isVerified={isEmailVerified}
                        />
                      )}

                      <Input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => {
                          setFormData({ ...formData, email: e.target.value });
                          setTouchedFields({ ...touchedFields, email: true });
                        }}
                        className={`focus:ring-2 focus:ring-[#FF8A00]/50 border-[#364957]/30 ${
                          touchedFields.email && !isValidEmail(formData.email)
                            ? "border-red-500"
                            : ""
                        }`}
                      />

                      {touchedFields.email && !isValidEmail(formData.email) && (
                        <p className="text-xs text-red-500">
                          Please enter a valid email address
                        </p>
                      )}
                    </div>

                    <div>
                      <Label className="flex items-center gap-2 text-sm font-medium mb-2">
                        <Phone className="w-4 h-4 text-[#364957]" />
                        Phone Number
                      </Label>
                      <Input
                        type="tel"
                        required
                        value={formData.phone_number}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        placeholder="+251XXXXXXXXX"
                        className="focus:ring-2 focus:ring-[#FF8A00]/50 border-[#364957]/30"
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
                            checked={formData.gender === "Female"}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                gender: e.target.value,
                              })
                            }
                            className="hidden peer"
                          />
                          <div className="w-full p-3 text-center border border-[#364957]/30 rounded-md peer-checked:border-[#FF8A00] peer-checked:bg-[#FF8A00]/10 transition-all cursor-pointer">
                            <div className="flex items-center justify-center gap-2">
                              <Venus className="w-5 h-5 text-[#364957] peer-checked:text-[#FF8A00]" />
                              <span className="text-sm text-[#364957]">
                                Female
                              </span>
                            </div>
                          </div>
                        </label>

                        <label className="flex-1">
                          <input
                            type="radio"
                            name="gender"
                            value="Male"
                            checked={formData.gender === "Male"}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                gender: e.target.value,
                              })
                            }
                            className="hidden peer"
                          />
                          <div className="w-full p-3 text-center border border-[#364957]/30 rounded-md peer-checked:border-[#FF8A00] peer-checked:bg-[#FF8A00]/10 transition-all cursor-pointer">
                            <div className="flex items-center justify-center gap-2">
                              <Mars className="w-5 h-5 text-[#364957] peer-checked:text-[#FF8A00]" />
                              <span className="text-sm text-[#364957]">
                                Male
                              </span>
                            </div>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/*                     <div>
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
                    </div> */}

                    <div>
                      <Label className="flex items-center gap-2 text-sm font-medium mb-2">
                        <Briefcase className="w-4 h-4 text-[#364957]" />
                        Experience
                      </Label>
                      <select
                        className="w-full border border-[#364957]/30 rounded-md px-3 py-2.5 bg-white text-[#364957]/90 focus:ring-2 focus:ring-[#FF8A00]/50"
                        value={formData.experience_years}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            experience_years: e.target.value,
                          })
                        }
                        required
                      >
                        <option value="" disabled>
                          Select experience
                        </option>
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
                      isDragActive
                        ? "border-[#FF8A00] bg-[#FF8A00]/10"
                        : "border-[#364957]/30"
                    }`}
                  >
                    <input {...getInputProps()} required />
                    <div className="flex flex-col items-center gap-3">
                      <UploadCloud
                        className={`w-8 h-8 ${
                          isDragActive ? "text-[#FF8A00]" : "text-[#364957]/50"
                        }`}
                      />
                      <p
                        className={`text-sm ${
                          isDragActive ? "text-[#FF8A00]" : "text-[#364957]/70"
                        }`}
                      >
                        {formData.resume ? (
                          <span className="font-medium text-[#364957]">
                            {formData.resume.name}
                          </span>
                        ) : (
                          <>
                            Drag & drop or{" "}
                            <span className="text-[#FF8A00]">browse files</span>
                          </>
                        )}
                      </p>
                      <p className="text-xs text-[#364957]/50">
                        PDF (Max 5MB, Max 3 pages)
                      </p>
                    </div>
                  </div>
                  {!isEmailVerified && (
                    <div className="mt-2 text-xs text-[#FF8A00] font-large">
                      <span>
                        {" "}
                        Verify your email to proceed with your application.{" "}
                      </span>
                    </div>
                  )}
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
                      backgroundColor: isFormValid()
                        ? SECONDARY_COLOR
                        : DISABLED_COLOR,
                      color: isFormValid() ? "white" : "#64748B",
                    }}
                    disabled={!isFormValid() || loading}
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      "Submit Application"
                    )}
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
              <CheckCircle
                className="w-16 h-16 text-green-500 mb-4"
                strokeWidth={1.5}
              />
              <h3 className="text-2xl font-bold text-[#364957] mb-2">
                Application Submitted!
              </h3>
              <p className="text-[#364957]/80 mb-6">
                Thank you for applying. We'll review your application and get
                back to you soon.
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
    </>
  );
}
