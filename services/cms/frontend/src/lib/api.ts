const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5050"; 
//const INTERVIEW_BASE = process.env.NEXT_PUBLIC_INTERVIEW_BASE || "http://localhost:8080/api/v1";

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

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem("accessToken");
  return token ? { "Authorization": `Bearer ${token}` } : {};
};

// ----- JOBS ENDPOINTS -----
export async function getJobs() {
  try {
    const headers = { ...getAuthHeaders() };
    const res = await fetch(`${API_BASE}/jobs`, { headers });
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
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
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
    const res = await fetch(`${API_BASE}/jobs/${id}`, { headers: { ...getAuthHeaders() } });
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
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
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
    const res = await fetch(`${API_BASE}/jobs/${jobId}/applications`, { headers: { ...getAuthHeaders() } });
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
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
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
    // First get all jobs
    const jobsResponse = await getJobs();
    if (!jobsResponse.success) {
      return { success: false, error: jobsResponse.error || "Failed to fetch jobs" };
    }

    // Fetch applications for each job
    let mergedApplications: any[] = [];
    for (const job of jobsResponse.jobs) {
      const applicationsResponse = await getJobApplications(job._id);
      if (applicationsResponse.success) {
        mergedApplications = mergedApplications.concat(applicationsResponse.applications);
      } else {
        console.error(`Failed to fetch applications for job ${job._id}:`, applicationsResponse.error);
      }
    }

    return { success: true, applications: mergedApplications };
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
    const res = await fetch(`${API_BASE}/applications/${id}/reject`, { method: "PATCH", headers: { ...getAuthHeaders() } });
    const data = await res.json();
    return data; // Expected { success: boolean, application: Application, error?: string }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to fetch application" };
  }
}

export async function acceptApplication(id: string) {
  try {
    const res = await fetch(`${API_BASE}/applications/${id}/accept`,
      { method: "PATCH", headers: { ...getAuthHeaders() } }
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
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
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
    const res = await fetch(`${API_BASE}/interview/schedule`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders()  },
      body: JSON.stringify({ application_id: application_id }),
    });
    const data = await res.json();
    return data; // Expected { success: boolean }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to schedule interview" };
  }
}

//login 
export async function login(authData: { email: string; password: string }): Promise<{ success: boolean; token?: string; userId?: string; role?: string; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(authData),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return { success: false, error: errorData.error || "Failed to login" };
    }

    const data = await res.json();
    const token = data.access_token;
    const { sub: userId, role } = JSON.parse(atob(token.split(".")[1]));

    if (!userId || !role) return { success: false, error: "Invalid token structure." };

    localStorage.setItem("accessToken", token);
    localStorage.setItem("userId", userId);
    localStorage.setItem("userRole", role);

    return { success: true, token, userId, role };
  } catch (error) {
    return { success: false, error: (error as Error).message || "Failed to login" };
  }
}

//HR account creation
export const createHRAccount = async (userData: any) => {
  const token = localStorage.getItem("accessToken");
  if (!token) return { success: false, error: "Unauthorized: No token provided" };

  try {
    const response = await fetch(`${API_BASE}/users/hr`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { success: false, error: errorData.error || `HTTP error! Status: ${response.status}` };
    }

    return { success: true, data: await response.json() };
  } catch (error) {
    return { success: false, error: (error as Error).message || "Network error occurred" };
  }
};

//update account
export const updateOwnAccount = async (userData: any) => {
  const token = localStorage.getItem("accessToken");
  const userId = localStorage.getItem("userId");
  if (!token || !userId) return { success: false, error: "Unauthorized: No token or user ID provided" };

  const requestData: Record<string, any> = { password: userData.newPassword };
  if (userData.firstName) requestData.firstName = userData.firstName;
  if (userData.lastName) requestData.lastName = userData.lastName;

  try {
    const response = await fetch(`${API_BASE}/users/${userId}/self`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { success: false, error: errorData.error || `HTTP error! Status: ${response.status}` };
    }

    return { success: true, data: await response.json() };
  } catch (error) {
    return { success: false, error: "Network error occurred" };
  }
};
