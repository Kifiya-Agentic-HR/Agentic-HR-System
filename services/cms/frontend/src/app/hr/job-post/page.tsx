"use client";

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
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  title: z.string().min(5, "Job title must be at least 5 characters"),
  type: z.enum(["inperson", "remote"]),
  commitment: z.enum(["full_time", "part_time", "internship"]),
  skills: z
    .array(
      z.object({
        skill: z.string().min(2, "Skill name required"),
        level: z.enum(["beginner", "intermediate", "expert"]),
      })
    )
    .min(1, "At least one skill required"),
  responsibilities: z.string().min(50, "Responsibilities must be detailed"),
  location: z.string().min(3, "Location must be specified"),
});

export default function JobPostingForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      type: "inperson",
      commitment: "full_time",
      skills: [],
      responsibilities: "",
      location: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      toast.success("Job posted successfully", {
        description: "New job listing has been published",
      });
      form.reset();
    } catch (error) {
      toast.error("Posting failed", {
        description: "There was an error creating the job post",
      });
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 transition-all duration-300 hover:shadow-3xl hover:-translate-y-1">
        <h2 className="text-3xl font-bold text-[#364957] mb-8 border-b-2 border-[#FF8A00]/30 pb-4">
          Post New Job
        </h2>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                name="commitment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#364957] text-lg font-semibold">
                      Commitment
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="border-2 border-[#364957]/20 text-lg">
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
                <div key={index} className="flex gap-4">
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
                      <FormItem className="w-40">
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
                            <SelectItem value="beginner">Beginner</SelectItem>
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
                        form.getValues("skills").filter((_, i) => i !== index)
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

            {/* Responsibilities */}
            <FormField
              control={form.control}
              name="responsibilities"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#364957] text-lg font-semibold">
                    Key Responsibilities
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the job responsibilities..."
                      className="border-2 border-[#364957]/20 min-h-[200px] text-lg"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-[#364957]/80">
                    Use bullet points or paragraphs to describe responsibilities
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
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full bg-[#FF8A00] hover:bg-[#FF8A00]/90 text-[#364957] font-bold
                text-xl py-6 transition-all duration-300 hover:scale-[1.02] shadow-lg
                hover:shadow-xl"
            >
              Post Job
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
