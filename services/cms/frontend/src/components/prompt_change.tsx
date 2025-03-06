"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const formSchema = z.object({
  interviewPurpose: z.string().min(10, {
    message: "Interview purpose must be at least 10 characters.",
  }),
  scoringCriteria: z.string().min(10, {
    message: "Scoring criteria must be at least 10 characters.",
  }),
  limitations: z.string().min(10, {
    message: "Limitations must be at least 10 characters.",
  }),
});

type PromptSettings = {
  interviewPurpose: string;
  scoringCriteria: string;
  limitations: string;
};

export default function PromptSettingsForm() {
  const [loading, setLoading] = useState(true);
  const [defaultValues, setDefaultValues] = useState<PromptSettings>({
    interviewPurpose: "",
    scoringCriteria: "",
    limitations: "",
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  useEffect(() => {
    const fetchPromptSettings = async () => {
      try {
        const mockData: PromptSettings = {
          interviewPurpose:
            "Evaluate technical skills for senior developer position",
          scoringCriteria:
            "Technical knowledge, problem-solving, communication, code quality",
          limitations:
            "Avoid discussing compensation, maintain professional tone",
        };
        setDefaultValues(mockData);
        form.reset(mockData);
      } catch (error) {
        toast.error("Error loading prompts", {
          description: "Failed to fetch current prompt settings",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPromptSettings();
  }, [form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Prompts updated successfully", {
        description: "New AI agent settings have been saved",
      });
    } catch (error) {
      toast.error("Update failed", {
        description: "There was an error saving your changes",
      });
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-7xl w-full mx-auto my-8">
        <h2 className="text-3xl font-bold text-[#364957] mb-8 border-b-2 border-[#FF8A00]/30 pb-4">
          AI Agent Configuration
        </h2>
        <div className="space-y-8">
          <div className="space-y-4">
            <Skeleton className="h-4 w-[30%] bg-[#364957]/20" />
            <Skeleton className="h-[120px] bg-[#364957]/10" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-4 w-[30%] bg-[#364957]/20" />
            <Skeleton className="h-[120px] bg-[#364957]/10" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-4 w-[30%] bg-[#364957]/20" />
            <Skeleton className="h-[120px] bg-[#364957]/10" />
          </div>
          <Skeleton className="h-12 w-full bg-[#FF8A00]/20" />
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-white rounded-xl shadow-2xl p-8 max-w-7xl w-full mx-auto my-8 
      transition-all duration-300 hover:-translate-y-1 hover:shadow-3xl"
    >
      <h2 className="text-3xl font-bold text-[#364957] mb-8 border-b-2 border-[#FF8A00]/30 pb-4">
        AI Agent Configuration
      </h2>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full space-y-8"
        >
          <FormField
            control={form.control}
            name="interviewPurpose"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#364957] text-lg font-semibold">
                  Interview Purpose
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Define the primary purpose of the interview..."
                    className="min-h-[120px] border-2 border-[#364957]/20 focus:border-[#FF8A00] 
                      focus-visible:ring-[#FF8A00]/50 text-[#364957] placeholder-[#364957]/50
                      transition-all duration-200 hover:border-[#364957]/30"
                    {...field}
                  />
                </FormControl>
                <FormDescription className="text-[#364957]/80 pl-2">
                  This will guide the AI's primary objective during interviews
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="scoringCriteria"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#364957] text-lg font-semibold">
                  Scoring Criteria
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="List evaluation criteria separated by commas..."
                    className="min-h-[120px] border-2 border-[#364957]/20 focus:border-[#FF8A00] 
                      focus-visible:ring-[#FF8A00]/50 text-[#364957] placeholder-[#364957]/50
                      transition-all duration-200 hover:border-[#364957]/30"
                    {...field}
                  />
                </FormControl>
                <FormDescription className="text-[#364957]/80 pl-2">
                  These metrics will be used to score candidates automatically
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="limitations"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#364957] text-lg font-semibold">
                  AI Limitations
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Specify topics or areas the AI should avoid..."
                    className="min-h-[120px] border-2 border-[#364957]/20 focus:border-[#FF8A00] 
                      focus-visible:ring-[#FF8A00]/50 text-[#364957] placeholder-[#364957]/50
                      transition-all duration-200 hover:border-[#364957]/30"
                    {...field}
                  />
                </FormControl>
                <FormDescription className="text-[#364957]/80 pl-2">
                  These restrictions will prevent unwanted conversations
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="w-full py-6 bg-[#FF8A00] hover:bg-[#FF8A00]/90 text-[#364957] font-bold
              text-lg transition-all duration-300 hover:scale-[1.02] shadow-md
              hover:shadow-lg"
          >
            {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
