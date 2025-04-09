"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
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
import { jobPost } from "@/lib/api";
import { Bot, Upload } from "lucide-react";
import { Chatbot } from "@/components/JobPostingChatbot";

const formSchema = z.object({
  title: z.string().min(5, "Job title must be at least 5 characters"),
  description: z.object({
    summary: z.string().min(10, "Summary must be at least 10 characters"),
    type: z.enum(["inperson", "remote"]),
    commitment: z.enum(["full_time", "part_time", "internship"]),
    qualification_level: z.string().optional(),
    responsibilities: z.string().min(50, "Responsibilities must be detailed"),
    location: z.string().min(3, "Location must be specified"),
  }),
  skills: z
    .array(
      z.object({
        skill: z.string().min(2, "Skill name required"),
        level: z.enum(["beginner", "intermediate", "expert"]),
      })
    )
    .min(1, "At least one skill is required"),
    jobDescriptionFile: z.any().refine(
      (value) => value instanceof File || value === undefined, 
      "Must be a valid file"
    ).optional(),
});

export type FormSchemaType = z.infer<typeof formSchema>;

export default function JobPostingForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("form");
  const [fileUploading, setFileUploading] = useState(false);
  const router = useRouter();

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: {
        summary: "",
        type: "inperson",
        commitment: "full_time",
        qualification_level: "",
        responsibilities: "",
        location: "",
      },
      skills: [{ skill: "", level: "beginner" }],
    },
  });

  const handleFileUpload = async (file: File) => {
    setFileUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      const response = await fetch("/api/parse-job-description", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      
      const data = await response.json();
      if (data.success) {
        form.reset(data.data);
        toast.success("Job description parsed successfully!");
      } else {
        throw new Error(data.error || "Failed to parse file");
      }
    } catch (error) {
      toast.error("File upload failed: " + (error as Error).message);
    } finally {
      setFileUploading(false);
    }
  };

  async function onSubmit(values: FormSchemaType) {
    const hr_id = localStorage.getItem("userId");
    if (!hr_id) {
      toast.error("HR ID is missing. Please log in again.");
      return;
    }

    try {
      setIsSubmitting(true);
      const skillsObject = values.skills.reduce(
        (acc, curr) => ({
          ...acc,
          [curr.skill]: { required_level: curr.level },
        }),
        {}
      );

      const payload = {
        title: values.title,
        description: {
          summary: values.description.summary,
          type: values.description.type,
          commitment: values.description.commitment,
          qualification_level: values.description.qualification_level || "",
          responsibilities: values.description.responsibilities,
          location: values.description.location,
        },
        job_status: "open",
        post_date: new Date().toISOString(),
        skills: skillsObject,
      };

      const result = await jobPost(hr_id, payload);
      if (result?.success) {
        router.push("/hr");
      } else {
        throw new Error(result?.error || "Failed to create job post");
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error("Posting failed: " + message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <FormProvider {...form}>
      <div className="relative">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="fixed bottom-8 right-8 z-50"
        >
          <Button
            onClick={() => setIsChatbotOpen(!isChatbotOpen)}
            className="rounded-full h-14 w-14 shadow-lg bg-[#FF8A00] hover:bg-[#FF8A00]/90"
          >
            <Bot className="h-12 w-12" />
          </Button>
        </motion.div>

        <Chatbot
          isOpen={isChatbotOpen}
          onClose={() => setIsChatbotOpen(false)}
          form={form}
        />

        <motion.div
          className="w-full max-w-4xl mx-auto px-4 py-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <motion.div
            className="bg-white rounded-xl shadow-2xl p-8"
            whileHover={{ scale: 1.01 }}
          >
            <h2 className="text-3xl font-bold text-[#364957] mb-8 border-b-2 border-[#FF8A00]/30 pb-4">
              Post New Job
            </h2>

            <div className="flex gap-4 mb-8">
              <Button
                variant={activeTab === "form" ? "default" : "outline"}
                onClick={() => setActiveTab("form")}
                className={`${
                  activeTab === "form"
                    ? "bg-[#FF8A00] text-white"
                    : "text-[#364957] border-[#364957]/20"
                }`}
              >
                Manual Entry
              </Button>
              <Button
                variant={activeTab === "upload" ? "default" : "outline"}
                onClick={() => setActiveTab("upload")}
                className={`${
                  activeTab === "upload"
                    ? "bg-[#FF8A00] text-white"
                    : "text-[#364957] border-[#364957]/20"
                }`}
              >
                Upload JD
              </Button>
            </div>

            {activeTab === "form" ? (
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-8"
                >
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
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description.summary"
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
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="description.type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#364957] text-lg font-semibold">
                          Job Type
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="border-2 border-[#364957]/20 text-lg">
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
                    name="description.commitment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#364957] text-lg font-semibold">
                          Commitment
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="border-2 border-[#364957]/20 text-lg">
                              <SelectValue placeholder="Select commitment" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="full_time">Full-Time</SelectItem>
                            <SelectItem value="part_time">Part-Time</SelectItem>
                            <SelectItem value="internship">
                              Internship
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

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
                                className="border-2 border-[#364957]/20"
                                {...field}
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
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="border-2 border-[#364957]/20">
                                  <SelectValue placeholder="Level" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="beginner">
                                  Beginner
                                </SelectItem>
                                <SelectItem value="intermediate">
                                  Intermediate
                                </SelectItem>
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
                        onClick={() =>
                          form.setValue(
                            "skills",
                            form
                              .getValues("skills")
                              .filter((_, i) => i !== index)
                          )
                        }
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    className="text-[#364957] border-[#364957]/20 hover:bg-[#FF8A00]/10"
                    onClick={() =>
                      form.setValue("skills", [
                        ...form.getValues("skills"),
                        { skill: "", level: "beginner" },
                      ])
                    }
                  >
                    Add Skill
                  </Button>
                </div>

                <FormField
                  control={form.control}
                  name="description.responsibilities"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#364957] text-lg font-semibold">
                        Key Responsibilities
                      </FormLabel>
                      <FormControl>
                      <Input
                          placeholder="Describe the job responsibilities..."
                          className="border-2 border-[#364957]/20 text-lg"
                          {...field}
                        />
                        {/* <RichTextEditor
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Describe the job responsibilities..."
                          className="bg-white"
                        /> */}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description.location"
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
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#FF8A00] hover:bg-[#FF8A00]/90 text-[#364957] font-bold text-xl py-6 transition-all hover:scale-[1.02] shadow-lg disabled:opacity-50"
                >
                  {isSubmitting ? "Posting..." : "Post Job"}
                </Button>
                </form>
              </Form>
            ) : (
              <div className="border-2 border-dashed border-[#364957]/20 rounded-xl p-8 text-center">
                <div className="mb-4">
                  <Upload className="h-12 w-12 text-[#364957]/50 mx-auto" />
                </div>
                <input
                  type="file"
                  id="jobDescriptionFile"
                  accept=".pdf,.docx"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                />
                <label
                  htmlFor="jobDescriptionFile"
                  className="cursor-pointer bg-[#FF8A00] text-white px-6 py-3 rounded-lg hover:bg-[#FF8A00]/90"
                >
                  {fileUploading ? "Uploading..." : "Upload Job Description"}
                </label>
                <p className="mt-4 text-[#364957]/50">
                  Supported formats: PDF, DOCX
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </FormProvider>
  );
}