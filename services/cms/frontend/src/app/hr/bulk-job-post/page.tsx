"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { jobPost, bulkUpload, getJobs } from "@/lib/api";

// Add bulk upload types
type JobOption = "existing" | "form" | "file";
type Job = { _id: string; title: string };

const formSchema = z.object({
  title: z.string().min(2, { message: "Job title must be at least 2 characters." }),
  summary: z.string().min(10, { message: "Summary must be at least 10 characters." }),
  type: z.enum(["inperson", "remote"]),
  commitment: z.enum(["full_time", "part_time", "internship"]),
  skills: z.array(
    z.object({
      skill: z.string().min(2, { message: "Skill name must be at least 2 characters." }),
      level: z.enum(["beginner", "intermediate", "expert"]),
    })
  ).min(1, { message: "At least one skill is required." }),
  responsibilities: z.string().min(10, { message: "Responsibilities must be at least 10 characters." }),
  location: z.string().min(2, { message: "Location must be at least 2 characters." }),
});

type FormSchemaType = z.infer<typeof formSchema>;

export default function BulkJobPostingForm() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedOption, setSelectedOption] = useState<JobOption>("existing");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [jobFile, setJobFile] = useState<File | null>(null);
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [applicants, setApplicants] = useState<any[]>([]);
  const router = useRouter();
  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      summary: "",
      type: "inperson",
      commitment: "full_time",
      skills: [{ skill: "", level: "beginner" }],
      responsibilities: "",
      location: "",
    },
  });

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const [jobsResponse] = await Promise.all([
          getJobs(),
        ]);

        if (jobsResponse.success && jobsResponse.jobs) {
          setJobs(jobsResponse.jobs);
        }

      } catch (error) {
        console.error("Failed to load existing jobs:", error);
        toast.error("Failed to load existing jobs");
      }
    };
    fetchJobs();
  }, []);

  const handleBulkUpload = async (values: FormSchemaType) => {
    if (!zipFile) {
      toast.error("Please upload a ZIP file with resumes");
      return;
    }

    const formData = new FormData();
    formData.append("zipfolder", zipFile);

    try {
      setIsProcessing(true);

      // Handle different job input types
      switch (selectedOption) {
        case "existing":
          if (!selectedJobId) {
            toast.error("Please select a job");
            return;
          }
          formData.append("job_id", selectedJobId);
          break;

        case "form":
          // Create skills object from state
          const skillsObject = values.skills.reduce((acc, curr) => ({
            ...acc,
            [curr.skill]: { required_level: curr.level }
          }), {});

          formData.append("job_data", JSON.stringify({
            title: values.title,
            description: {
              summary: values.summary,
              type: values.type,
              commitment: values.commitment,
              responsibilities: values.responsibilities,
              location: values.location
            },
            skills: skillsObject
          }));
          break;

        case "file":
          if (!jobFile) {
            toast.error("Please upload a job description file");
            return;
          }
          formData.append("job_file", jobFile);
          break;
      }

      const result = await bulkUpload(formData);
      if (result.success) {
        setApplicants(result.applicants);
        toast.success(`Processed ${result.processed_count} resumes`);
        toast.success("Failed Resumes: " + (result.failed_resumes?.length || 0));
      } else {
        throw new Error(result.error || "Bulk upload failed");
      }
    } catch (error) {
      toast.error("Processing failed: " + (error as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <motion.div className="w-full max-w-4xl mx-auto px-4" style={{ backgroundColor: '#fff' }}>
      <div className="rounded-xl shadow-2xl p-8 bg-white">
        <h2 className="text-3xl font-bold text-[#364957] mb-8">
          <span className="relative after:content-[''] after:absolute after:left-0 after:-bottom-2 after:w-full after:h-0.5 after:bg-[#FF6A00]">
            Bulk Resume Processing
          </span>
        </h2>

        {/* Job Input Options */}
        <div className="mb-8">
          <div className="flex gap-4 mb-6">
            <Button
              variant={selectedOption === "existing" ? "default" : "outline"}
              onClick={() => setSelectedOption("existing")}
            >
              Existing Job
            </Button>
            <Button
              variant={selectedOption === "file" ? "default" : "outline"}
              onClick={() => setSelectedOption("file")}
            >
              Upload Job File
            </Button>
          </div>

          {selectedOption === "existing" && (
            <div className="space-y-4">
              <Select onValueChange={setSelectedJobId} value={selectedJobId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select existing job" />
                </SelectTrigger>
                <SelectContent className="bg-white shadow-md">
                  {jobs?.map(job => (
                    <SelectItem key={job._id} value={job._id}>
                      {job.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {selectedOption === "file" && (
            <div className="space-y-4">
              <Input
                type="file"
                accept=".pdf,.docx"
                onChange={(e) => setJobFile(e.target.files?.[0] || null)}
                style={{ height: '48px', fontSize: '1rem' }}
              />
              <p className="text-sm text-muted-foreground">
                Upload PDF/DOCX job description
              </p>
            </div>
          )}
        </div>

        {/* Resume ZIP Upload */}
        <div className="mb-4">
          <Input
            type="file"
            accept=".zip"
            onChange={(e) => setZipFile(e.target.files?.[0] || null)}
            style={{ height: '48px', fontSize: '1rem' }}
          />
          <p className="text-sm text-muted-foreground mt-2">
            Upload ZIP file containing resumes (PDF/DOCX/TXT)
          </p>
        </div>

        {/* Process Resumes Button */}
        <div className="flex justify-end mt-4">
          <Button
            onClick={handleBulkUpload}
            disabled={isProcessing}
            className="bg-[#FF8A00] hover:bg-[#FF8A00]/90 text-white"
          >
            {isProcessing ? "Processing Resumes..." : "Process Resumes"}
          </Button>
        </div>

        {/* Applicants Display */}
        {applicants && applicants.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xl font-bold mb-4">Applicants ({applicants.length})</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full leading-normal shadow-md rounded-lg overflow-hidden">
                <thead className="bg-gray-200 text-gray-700">
                  <tr>
                    <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider">
                      Matched Skills
                    </th>
                    <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider">
                      Score
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {applicants.map((applicant, index) => (
                    <tr key={index}>
                      <td className="px-5 py-5 border-b border-gray-200 text-sm">
                        <p className="text-gray-900 whitespace-no-wrap">{applicant.name || 'N/A'}</p>
                      </td>
                      <td className="px-5 py-5 border-b border-gray-200 text-sm">
                        <p className="text-gray-900 whitespace-no-wrap">{applicant.email || 'N/A'}</p>
                      </td>
                      <td className="px-5 py-5 border-b border-gray-200 text-sm">
                        <p className="text-gray-900 whitespace-no-wrap">{applicant.phone || 'N/A'}</p>
                      </td>
                      <td className="px-5 py-5 border-b border-gray-200 text-sm">
                        <ul className="list-disc list-inside">
                          {applicant.matched_skills?.map((skill: any, i: number) => (
                            <li key={i} className="text-gray-900 whitespace-no-wrap">
                              {skill.skill} ({skill.level})
                            </li>
                          )) || <li>N/A</li>}
                        </ul>
                      </td>
                      <td className="px-5 py-5 border-b border-gray-200 text-sm">
                        <p className="text-gray-900 whitespace-no-wrap">{applicant.score || 'N/A'}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
