"use client";

import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { z } from "zod";
import { UploadIcon } from "@radix-ui/react-icons";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
  description: z.string().optional(),
});

export default function KnowledgeBaseUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { description: "" },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFile(acceptedFiles[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
    },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!file) {
      toast.error("Please select a file to upload.");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("description", values.description || "");

      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast.success("File uploaded successfully", {
        description: "Your document has been added to the knowledge base.",
      });
      setFile(null);
      form.reset();
    } catch (error) {
      toast.error("Upload failed", {
        description:
          "There was an error uploading your file. Please try again.",
      });
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4">
      {" "}
      <div className="bg-[#FFF4E6] rounded-xl shadow-2xl p-8 transition-all duration-300 hover:shadow-3xl hover:-translate-y-1">
        <h2 className="text-3xl font-bold text-[#364957] mb-8 border-b-2 border-[#FF8A00]/30 pb-4">
          Add to Knowledge Base
        </h2>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all
                ${
                  isDragActive
                    ? "border-[#364957] bg-[#364957]/10"
                    : "border-[#364957]/20"
                } hover:border-[#364957]/40`}
            >
              <input {...getInputProps()} />
              <div className="space-y-4">
                <p className="text-xl text-[#364957] font-semibold">
                  {isDragActive
                    ? "Drop the file here"
                    : "Drag & drop a file here, or click to select"}
                </p>
                <div className="flex items-center gap-3 justify-center text-lg text-[#364957]/80">
                  <UploadIcon className="w-6 h-6" />
                  <span>Supported formats: PDF, DOC, DOCX (max 10MB)</span>
                </div>
              </div>
            </div>

            {file && (
              <div className="bg-white/50 rounded-xl p-5 flex items-center justify-between border border-[#364957]/20">
                <span className="font-medium text-lg text-[#364957]">
                  {file.name}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setFile(null)}
                  className="text-[#364957] hover:text-[#364957]/80 text-lg"
                >
                  Remove
                </Button>
              </div>
            )}

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#364957] text-lg font-semibold">
                    Description (optional)
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Add a brief description..."
                      className="focus:border-[#FF8A00] focus-visible:ring-[#FF8A00] 
                        border-2 border-[#364957]/20 text-lg py-6 hover:border-[#364957]/30
                        transition-all duration-200"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-[#364957]/80 text-base">
                    Provide context about this document for better searchability
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={isUploading || !file}
              className="w-full bg-[#FF8A00] hover:bg-[#FF8A00]/90 text-[#364957] font-bold
                text-xl py-7 transition-all duration-300 hover:scale-[1.02] shadow-lg
                hover:shadow-xl"
            >
              {isUploading ? "Uploading..." : "Upload Document"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
