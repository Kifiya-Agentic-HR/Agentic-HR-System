const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL

export type Job = {
  _id: string;
  title: string;
  description: {
    type: string;
    summary: string;
    responsibilities: string;
    commitment: string;
  };
  job_status: string;
  skills: string[];
  postDate: string;
  created_at: string;
};


const jobTypeMap: Record<string, string> = {
  in_person: "In Person",
  inperson: "In Person",
  remote: "Remote",
  hybrid: "Hybrid",
};

const commitmentMap: Record<string, string> = {
  full_time: "Full Time",
  part_time: "Part Time",
  internship: "Internship",
};

//format job details
export function formatJobDetails(job: Job): Job {
  return {
    ...job,
    description: {
      ...job.description,
      type: jobTypeMap[job.description.type.toLowerCase()] || job.description.type, // Default to original if not mapped
      commitment: commitmentMap[job.description.commitment.toLowerCase()] || job.description.commitment,
    },
  };
}

// filter jobs
export async function findJobs({
  search,
  type,
  skills,
}: {
  search?: string;
  type?: string;
  skills?: string;
}): Promise<Job[]> {
  const jobs = await getJobs();

  
  return jobs
    .map(formatJobDetails) 
    .filter((job) => {
      const matchesSearch = search
        ? job.title.toLowerCase().includes(search.toLowerCase()) ||
          job.description.summary.toLowerCase().includes(search.toLowerCase())
        : true;

      const matchesType = type
        ? job.description.type.toLowerCase() === type.toLowerCase()
        : true;

      const matchesSkills = skills
        ? skills
            .toLowerCase()
            .split(",")
            .every((skill) =>
              job.skills.map((s) => s.toLowerCase()).includes(skill.trim())
            )
        : true;

      return matchesSearch && matchesType && matchesSkills;
    });
}

export async function getJobs(): Promise<Job[]> {
  try {
    const response = await fetch(`${API_BASE}/jobs/`);
    if (!response.ok) {
      throw new Error(`Error fetching jobs: ${response.statusText}`);
    }

    const data = await response.json();
    
    return (data.jobs || []).map(formatJobDetails); 
  } catch (error) {
    console.error("Failed to fetch jobs:", error);
    return [];
  }
}

// single job fetch 
export const getJob = async (jobId: string): Promise<Job | null> => {
  try {
    const url = `${API_BASE}/jobs/${jobId}`;
    console.log(`Sending request to: ${url}`);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch job: ${response.statusText}`);
    }

    const data = await response.json();
    const job = data.job ? formatJobDetails(data.job) : null; 

    console.log("Job data:", job);
    return job;
  } catch (error) {
    console.error("Error fetching job:", error);
    return null;
  }
};

// application-service.ts
export interface ApplicationFormData {
  full_name: string;
  email: string;
  phone_number: string;
  gender: string;
  disability: string;
  experience_years: string;
  resume: File | null;
}

export const submitApplication = async (formData: ApplicationFormData, jobId: string) => {
  const formPayload = new FormData();
  formPayload.append('full_name', formData.full_name);
  formPayload.append('email', formData.email);
  formPayload.append('phone_number', formData.phone_number);
  formPayload.append('gender', formData.gender);
  formPayload.append('disability', formData.disability);
  formPayload.append('experience_years', formData.experience_years);
  formPayload.append('job_id', jobId);
  
  if (formData.resume) {
    formPayload.append('cv', formData.resume, formData.resume.name);
  }

  const response = await fetch(`${API_BASE}/applications`, {
    method: 'POST',
    body: formPayload,
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Application failed');
  return data;
};

export interface OtpResponse {
  message: string;
}

export interface HealthCheckResponse {
  status: string;
  redis: string;
}

export const OtpAPI = {
  sendOtp: async (email: string): Promise<OtpResponse> => {
    // Here, you need to adjust the payload to include the 'otp', 'type', 'subject', and 'title'
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Example, you should receive this from backend ideally
    const payload = {
      email,
      otp,
      type: 'otp_verification',
      subject: 'Your Verification Code',
      title: 'Account Verification'
    };
    return handleRequest('/otp/send', 'POST', payload);
  },

  resendOtp: async (email: string): Promise<OtpResponse> => {
    // Assuming resend keeps a similar structure
    return handleRequest('/otp/resend', 'POST', { email });
  },

  verifyOtp: async (email: string, otp: string): Promise<OtpResponse> => {
    return handleRequest('/otp/verify', 'POST', { email, otp });
  },

  checkHealth: async (): Promise<HealthCheckResponse> => {
    return handleRequest('/otp/health', 'GET');
  },
};

// Generic request handler
async function handleRequest<T>(
  endpoint: string,
  method: 'GET' | 'POST',
  body?: Record<string, any>
): Promise<T> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: method !== 'GET' ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Request failed');
    }

    return data;
  } catch (error) {
    console.error(`API Request Error (${endpoint}):`, error);
    throw new Error(
      error instanceof Error ? error.message : 'An unexpected error occurred'
    );
  }
}
