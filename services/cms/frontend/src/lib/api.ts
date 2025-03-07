const API_BASE = process.env.NEXT_PUBLIC_API_BASE || ""; 

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

export async function updateApplicationStatus(id: string, updates: any) {
  try {
    const res = await fetch(`${API_BASE}/applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    return data; // Expected { success: boolean, application: Application, error?: string }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update application status" };
  }
}

// ----- INTERVIEW ENDPOINTS -----
export async function scheduleInterview(scheduleData: { application_id: string; candidate_id: string }) {
  try {
    const res = await fetch(`${API_BASE}/schedule`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(scheduleData),
    });
    const data = await res.json();
    return data; // Expected { success: boolean }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to schedule interview" };
  }
}

export async function getInterviewSession(interviewId: string) {
  try {
    const res = await fetch(`${API_BASE}/session/${interviewId}`);
    const data = await res.json();
    return data; // Expected { success: boolean, session_id: string, interview_id: string, chat_history: any[], error?: string }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to fetch interview session" };
  }
}

export async function postChat(chatData: { user_answer: string; session_id: string }) {
  try {
    const res = await fetch(`${API_BASE}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(chatData),
    });
    const data = await res.json();
    return data; // Expected { success: boolean, text: string, state: "welcome" | "ongoing" | "completed", error?: string }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to post chat message" };
  }
}