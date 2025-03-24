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
          Bulk Resume Processing
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
              variant={selectedOption === "form" ? "default" : "outline"}
              onClick={() => setSelectedOption("form")}
            >
              New Job Form
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

          {selectedOption === "form" && (
            <motion.div
              className="w-full max-w-4xl mx-auto px-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <motion.div>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleBulkUpload)} className="space-y-8">
                    {/* Job Title */}
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#364957] text-lg font-semibold">
                            Job Title
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter job title"
                              className="border-2 border-[#364957]/20 focus:border-[#FF8A00] text-lg"
                              {...field}
                              style={{ height: '48px', fontSize: '1rem' }} // Increased size
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Summary Field */}
                    <FormField
                      control={form.control}
                      name="summary"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#364957] text-lg font-semibold">
                            Job Summary
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter a brief job summary"
                              className="border-2 border-[#364957]/20 focus:border-[#FF8A00] text-lg"
                              {...field}
                              style={{ height: '48px', fontSize: '1rem' }} // Increased size
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Type & Commitment */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[#364957] text-lg font-semibold">
                              Job Type
                            </FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="border-2 border-[#364957]/20 text-lg" style={{ height: '48px' }}>
                                  <SelectValue placeholder="Select job type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="inperson">In-Person</SelectItem>
                                <SelectItem value="remote">Remote</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="commitment"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[#364957] text-lg font-semibold">
                              Commitment
                            </FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="border-2 border-[#364957]/20 text-lg" style={{ height: '48px' }}>
                                  <SelectValue placeholder="Select commitment" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="full_time">Full-Time</SelectItem>
                                <SelectItem value="part_time">Part-Time</SelectItem>
                                <SelectItem value="internship">Internship</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Skills Section */}
                    <div className="space-y-4">
                      <FormLabel className="text-[#364957] text-lg font-semibold">
                        Required Skills
                      </FormLabel>
                      {form.watch("skills").map((_, index) => (
                        <div
                          key={index}
                          className="flex flex-col md:flex-row gap-4 items-start md:items-end"
                        >
                          <FormField
                            control={form.control}
                            name={`skills.${index}.skill`}
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormControl>
                                  <Input
                                    placeholder="Skill name"
                                    className="border-2 border-[#364957]/20 text-lg"
                                    {...field}
                                    style={{ height: '48px', fontSize: '1rem' }} // Increased size
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`skills.${index}.level`}
                            render={({ field }) => (
                              <FormItem className="w-[150px]">
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="border-2 border-[#364957]/20 text-lg" style={{ height: '48px' }}>
                                      <SelectValue placeholder="Level" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="beginner">Beginner</SelectItem>
                                    <SelectItem value="intermediate">Intermediate</SelectItem>
                                    <SelectItem value="expert">Expert</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            className="text-[#FF8A00] hover:text-[#FF8A00]/80"
                            onClick={() => {
                              const updatedSkills = form.getValues("skills").filter((_, i) => i !== index);
                              form.setValue("skills", updatedSkills);
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        className="text-[#364957] border-[#364957]/20 hover:bg-[#FF8A00]/10"
                        onClick={() => {
                          form.setValue("skills", [...form.getValues("skills"), { skill: "", level: "beginner" }]);
                        }}
                      >
                        Add Skill
                      </Button>
                    </div>

                    {/* Responsibilities (Rich Text Editor) */}
                    <FormField
                      control={form.control}
                      name="responsibilities"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#364957] text-lg font-semibold">
                            Key Responsibilities
                          </FormLabel>
                          <FormControl>
                            <RichTextEditor
                              value={field.value}
                              onChange={field.onChange}
                              placeholder="Describe the job responsibilities... (Use bold/italic/lists, etc.)"
                              className="bg-white"
                            />
                          </FormControl>
                          <FormDescription className="text-[#364957]/80">
                            Use bullet points or paragraphs, and feel free to apply bold or italic text.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Location */}
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#364957] text-lg font-semibold">
                            Location
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter job location"
                              className="border-2 border-[#364957]/20 text-lg"
                              {...field}
                              style={{ height: '48px', fontSize: '1rem' }} // Increased size
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </form>
                </Form>
              </motion.div>
            </motion.div>
          )}

          {selectedOption === "file" && (
            <div className="space-y-4">
              <Input
                type="file"
                accept=".pdf,.docx"
                onChange={(e) => setJobFile(e.target.files?.[0] || null)}
                style={{ height: '48px', fontSize: '1rem' }} // Increased size
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
            style={{ height: '48px', fontSize: '1rem' }} // Increased size
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
            className="bg-[#FF8A00] hover:bg-[#FF8A00]/90"
          >
            {isProcessing ? "Processing Resumes..." : "Process Resumes"}
          </Button>
        </div>

        {/* Applicants Display */}
        {applicants.length > 0 && (
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
