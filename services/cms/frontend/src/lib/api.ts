const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:9000"; 
const INTERVIEW_BASE = process.env.NEXT_PUBLIC_INTERVIEW_BASE || "http://localhost:8080/api/v1";

interface JobCreate {
  title: string;
  description: {
    summary: string;
    type: "inperson" | "remote";
    commitment: "full_time" | "part_time" | "internship";
    qualification_level?: string;
    responsibilities: string;
    location: string;
  };
  commitment?: string;
  type?: string;
  job_status?: string;
  post_date?: Date;
  skills: Record<string, Record<string, string>>;
}

// ----- JOBS ENDPOINTS -----
export async function getJobs() {
  try {
    const res = await fetch(`${API_BASE}/jobs`);
    const data = await res.json();
    return data; // Expected { success: boolean, jobs: Job[], error?: string }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to fetch jobs" };
  }
}

export async function createJob(jobData: any) {
  try {
    const res = await fetch(`${API_BASE}/jobs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(jobData),
    });
    const data = await res.json();
    return data; // Expected { success: boolean, job: Job, error?: string }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create job" };
  }
}

export async function getJobById(id: string) {
  try {
    const res = await fetch(`${API_BASE}/jobs/${id}`);
    const data = await res.json();
    return data; // Expected { success: boolean, job: Job, error?: string }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to fetch job" };
  }
}

export async function updateJob(id: string, jobData: any) {
  try {
    const res = await fetch(`${API_BASE}/jobs/${id}`, {
      method: "PUT", // or PATCH, depending on your backend implementation
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(jobData),
    });
    const data = await res.json();
    return data; // Expected { success: boolean, job: Job, error?: string }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update job" };
  }
}

export async function getJobApplications(jobId: string) {
  try {
    const res = await fetch(`${API_BASE}/jobs/${jobId}/applications`);
    const data = await res.json();
    return data; // Expected { success: boolean, applications: Application[], error?: string }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to fetch applications for job" };
  }
}

// ----- APPLICATIONS ENDPOINTS ----- 
export async function createApplication(appData: any) {
  try {
    const res = await fetch(`${API_BASE}/applications`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(appData),
    });
    const data = await res.json();
    return data; // Expected { success: boolean, application: Application, error?: string }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create application" };
  }
}

export async function getApplications() {
  try {
    const res = await fetch(`${API_BASE}/applications`);
    const data = await res.json();
    return data; // Expected { success: boolean, applications: Application[], error?: string }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to fetch applications" };
  }
}

export async function getApplicationById(id: string) {
  try {
    const res = await fetch(`${API_BASE}/applications/${id}`);
    const data = await res.json();
    return data; // Expected { success: boolean, application: Application, error?: string }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to fetch application" };
  }
}

export async function rejectApplication(id: string) {
  try {
    const res = await fetch(`${API_BASE}/applications/${id}/reject`, { method: "PATCH" });
    const data = await res.json();
    return data; // Expected { success: boolean, application: Application, error?: string }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to fetch application" };
  }
}

export async function acceptApplication(id: string) {
  try {
    const res = await fetch(`${API_BASE}/applications/${id}/accept`,
      { method: "PATCH" }
        );
    const data = await res.json();
    return data; // Expected { success: boolean, application: Application, error?: string }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to fetch application" };
  }
}

export async function jobPost(jobData: JobCreate) {
  try {
    const res = await fetch(`${API_BASE}/jobs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(jobData),
    });
    const data = await res.json();
    return data; // Expected { success: boolean, job: Job, error?: string }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create job" };
  }
}

// export async function updateApplicationStatus(id: string, updates: any) {
//   try {
//     const res = await fetch(`${API_BASE}/applications/${id}`, {
//       method: "PATCH",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(updates),
//     });
//     const data = await res.json();
//     return data; // Expected { success: boolean, application: Application, error?: string }
//   } catch (error: any) {
//     return { success: false, error: error.message || "Failed to update application status" };
//   }
// }

// ----- INTERVIEW ENDPOINTS -----
export async function scheduleInterview(application_id: string) {
  try {
    const res = await fetch(`${INTERVIEW_BASE}/interview/schedule`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ application_id: application_id }),
    });
    const data = await res.json();
    return data; // Expected { success: boolean }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to schedule interview" };
  }
}
