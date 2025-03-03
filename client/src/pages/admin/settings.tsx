import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import RoleNav from "@/components/ui/role-nav";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Upload, X } from "lucide-react";
import { User } from "@shared/schema";

export default function AdminSettings() {
  const { toast } = useToast();

  // Fetch HR accounts
  const { data: hrAccounts, isLoading: isLoadingHR } = useQuery<User[]>({
    queryKey: ["/api/users/hr"],
  });

  // Form for creating new HR account
  const hrForm = useForm({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      role: "HR"
    }
  });

  // Form for interview agent prompt
  const promptForm = useForm({
    defaultValues: {
      prompt: ""
    }
  });

  // Mutations
  const createHRMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/users/hr", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users/hr"] });
      toast({
        title: "Success",
        description: "HR account created successfully",
      });
      hrForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteHRMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/users/hr/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users/hr"] });
      toast({
        title: "Success",
        description: "HR account deleted successfully",
      });
    },
  });

  const updatePromptMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("PATCH", "/api/settings/prompt", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Interview agent prompt updated successfully",
      });
    },
  });

  const uploadKnowledgeBaseMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/settings/knowledge-base", {
        method: "POST",
        body: formData,
        credentials: "include"
      });
      if (!res.ok) throw new Error("Upload failed");
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Knowledge base file uploaded successfully",
      });
    },
  });

  return (
    <div className="flex min-h-screen">
      <RoleNav />
      <main className="flex-1 p-8">
        <Tabs defaultValue="prompt" className="max-w-4xl mx-auto">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="prompt">Prompt</TabsTrigger>
            <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
            <TabsTrigger value="hr">HR Accounts</TabsTrigger>
            <TabsTrigger value="account">Account Info</TabsTrigger>
          </TabsList>

          <TabsContent value="prompt">
            <Card>
              <CardHeader>
                <CardTitle>Interview Agent Prompt</CardTitle>
                <CardDescription>
                  Customize the behavior of the interview agent
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...promptForm}>
                  <form onSubmit={promptForm.handleSubmit((data) => updatePromptMutation.mutate(data))} className="space-y-4">
                    <FormField
                      control={promptForm.control}
                      name="prompt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prompt</FormLabel>
                          <FormControl>
                            <Textarea rows={10} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" disabled={updatePromptMutation.isPending}>
                      {updatePromptMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save Prompt
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="knowledge">
            <Card>
              <CardHeader>
                <CardTitle>Knowledge Base</CardTitle>
                <CardDescription>
                  Upload files to extend the interview agent's knowledge
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <Input
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) uploadKnowledgeBaseMutation.mutate(file);
                    }}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <Upload className="h-8 w-8" />
                    <span>Click to upload or drag and drop</span>
                    <span className="text-sm text-muted-foreground">
                      PDF, DOC, TXT up to 10MB
                    </span>
                  </label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="hr">
            <Card>
              <CardHeader>
                <CardTitle>HR Account Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4">Create HR Account</h3>
                  <Form {...hrForm}>
                    <form onSubmit={hrForm.handleSubmit((data) => createHRMutation.mutate(data))} className="space-y-4">
                      <FormField
                        control={hrForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={hrForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" disabled={createHRMutation.isPending}>
                        {createHRMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create HR Account
                      </Button>
                    </form>
                  </Form>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">HR Accounts</h3>
                  {isLoadingHR ? (
                    <div className="flex justify-center">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {hrAccounts?.map((account) => (
                        <div key={account.id} className="flex items-center justify-between p-4 border rounded">
                          <div>
                            <p className="font-medium">{account.username}</p>
                            <p className="text-sm text-muted-foreground">{account.name}</p>
                          </div>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => deleteHRMutation.mutate(account.id)}
                            disabled={deleteHRMutation.isPending}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Account settings for admin users coming soon...
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
