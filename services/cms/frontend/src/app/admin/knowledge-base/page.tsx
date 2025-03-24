"use client";

import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { UploadIcon, FileIcon, CrossCircledIcon, InfoCircledIcon } from "@radix-ui/react-icons";

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
import { uploadDocument } from "@/lib/api";
import { Progress } from "@/components/ui/progress";

const formSchema = z.object({
  tag: z.string().min(1, "Tag is required"),
  source: z.string().min(1, "Source is required"),
  author: z.string().optional(),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function KnowledgeBaseUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tag: "",
      source: "",
      author: "",
      description: "",
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    setFile(file);
    // Animate progress bar for visual feedback
    setUploadProgress(0);
    const timer = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 10;
      });
    }, 100);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
  });

  async function onSubmit(values: FormValues) {
    if (!file) {
      toast.error("Please select a file to upload.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const metadata = {
        tag: values.tag,
        source: values.source,
        author: values.author || undefined,
        custom_metadata: {
          description: values.description,
        },
      };

      const result = await uploadDocument(file, metadata);

      if (!result.success) {
        throw new Error(result.error);
      }

      toast.success("Document uploaded successfully!", {
        description: "Your document has been added to the knowledge base.",
      });

      setFile(null);
      form.reset();
      setUploadProgress(0);
    } catch (error: any) {
      toast.error("Upload failed", {
        description: error.message || "There was an error uploading your file. Please try again.",
      });
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-7xl mx-auto px-4 py-8"
    >
      <div className="bg-gradient-to-br from-[#FFF4E6] to-[#FFE4CC] rounded-2xl shadow-2xl p-8 transition-all duration-300 hover:shadow-3xl">
        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl font-bold text-[#364957] mb-8 border-b-2 border-[#FF8A00]/30 pb-4 flex items-center gap-3"
        >
          <InfoCircledIcon className="w-8 h-8 text-[#FF8A00]" />
          Knowledge Base Upload
        </motion.h2>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <motion.div
              {...getRootProps()}
              className={`border-3 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all relative overflow-hidden
                ${isDragActive ? "border-[#FF8A00] bg-[#FF8A00]/10" : "border-[#364957]/20"}
                hover:border-[#FF8A00] hover:bg-[#FF8A00]/5`}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <input {...getInputProps()} />
              <AnimatePresence>
                {!file ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-4"
                  >
                    <UploadIcon className="w-12 h-12 mx-auto text-[#FF8A00]" />
                    <p className="text-xl text-[#364957] font-semibold">
                      {isDragActive ? "Drop your file here" : "Drag & drop your file here"}
                    </p>
                    <p className="text-[#364957]/60">or click to browse</p>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <FileIcon className="w-12 h-12 mx-auto text-[#FF8A00]" />
                    <p className="text-lg font-medium text-[#364957]">{file.name}</p>
                    <Progress value={uploadProgress} className="w-64 mx-auto" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="tag"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#364957] font-semibold">Tag</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="border-2 focus:border-[#FF8A00] focus-visible:ring-[#FF8A00]"
                        placeholder="e.g., Technical Documentation"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="source"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#364957] font-semibold">Source</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="border-2 focus:border-[#FF8A00] focus-visible:ring-[#FF8A00]"
                        placeholder="e.g., Internal Documentation"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="author"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#364957] font-semibold">
                      Author <span className="text-[#364957]/60">(Optional)</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="border-2 focus:border-[#FF8A00] focus-visible:ring-[#FF8A00]"
                        placeholder="e.g., John Doe"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#364957] font-semibold">
                      Description <span className="text-[#364957]/60">(Optional)</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="border-2 focus:border-[#FF8A00] focus-visible:ring-[#FF8A00]"
                        placeholder="Brief description of the document"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Button
                type="submit"
                disabled={isUploading || !file}
                className={`w-full bg-[#FF8A00] hover:bg-[#FF8A00]/90 text-white font-bold
                  text-xl py-6 transition-all duration-300 rounded-xl
                  ${isUploading ? "opacity-70 cursor-not-allowed" : "hover:scale-[1.02]"}
                  disabled:opacity-50 disabled:cursor-not-allowed
                  shadow-[0_0_15px_rgba(255,138,0,0.3)]
                  hover:shadow-[0_0_25px_rgba(255,138,0,0.4)]`}
              >
                {isUploading ? (
                  <div className="flex items-center gap-2">
                    <span className="animate-spin">⏳</span>
                    <span>Uploading...</span>
                  </div>
                ) : (
                  "Upload Document"
                )}
              </Button>
            </motion.div>
          </form>
        </Form>
      </div>
    </motion.div>
  );
}