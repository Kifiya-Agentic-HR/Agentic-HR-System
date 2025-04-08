
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL
const INTERVIEW_BASE = process.env.NEXT_PUBLIC_API_BASE_URL
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

interface IngestionMetadata {
  tag: string;
  source: string;
  author?: string;
  custom_metadata?: Record<string, any>;
}


export async function uploadDocument(
  file: File,
  metadata: IngestionMetadata,
  onProgress?: (progress: number) => void
) {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('metadata', JSON.stringify(metadata));

    const headers = {
      ...getAuthHeaders(),
     
    };

    const res = await fetch(`${INTERVIEW_BASE}/rag/ingest/documents`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.detail || 'Upload failed');
    }

    const data = await res.json();
    return {
      success: true,
      data,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to upload document',
    };
  }
}

// Add document deletion function
export async function deleteDocument(documentId: string) {
  try {
    const res = await fetch(`${API_BASE}/rag/ingest/documents/${documentId}`, {
      method: 'DELETE',
      headers: { ...getAuthHeaders() },
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.detail || 'Deletion failed');
    }

    const data = await res.json();
    return {
      success: true,
      data,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to delete document',
    };
  }
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
    return data; 
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
    return data; 
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create job" };
  }
}

export async function getJobById(id: string) {
  try {
    const res = await fetch(`${API_BASE}/jobs/${id}`, { headers: { ...getAuthHeaders() } });
    const data = await res.json();
    return data; 
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to fetch job" };
  }
}

export async function updateJob(id: string, jobData: any) {
  try {
    const res = await fetch(`${API_BASE}/jobs/${id}`, {
      method: "PATCH", 
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(jobData),
    });
    const data = await res.json();
    return data; 
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update job" };
  }
}

export async function getJobApplications(jobId: string) {
  try {
    const res = await fetch(`${API_BASE}/jobs/${jobId}/applications`, { headers: { ...getAuthHeaders() } });
    const data = await res.json();
    return data; 
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
    return data; 
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create application" };
  }
}

export async function getApplications() {
  try {
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
    return data; 
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to fetch application" };
  }
}

export async function getMe() {
  try {
    const res = await fetch(`${API_BASE}/users/me/name`, { headers: { ...getAuthHeaders() } });
    const data = await res.json();
    return data; 
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to fetch user" };
  }
}

export async function rejectApplication(id: string) {
  try {
    const res = await fetch(`${API_BASE}/applications/${id}/reject`, { method: "PATCH", headers: { ...getAuthHeaders() } });
    const data = await res.json();
    return data; 
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
    return data; 
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to fetch application" };
  }
}

// Screening endpoint

export const updateScreeningScore = async (
  applicationId: string,
  score: number,
  comment: string
) => {
  try {
    const payload = {
      score: score.toString(), 
      comment,
    };

    const response = await fetch(
      `${API_BASE}/applications/edit_score/${applicationId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update score');
    }

    return await response.json();
  } catch (error) {
    console.error(' Error updating screening score:', error);
    return {
      success: false,
      error: error?.message || 'Failed to update score',
    };
  }
};



export async function jobPost(hr_id: string, jobData: JobCreate) {
  const params = new URLSearchParams({ hr_id }).toString();
  const url = `${API_BASE}/jobs/?${params}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(jobData),
    });

    if (!response.ok) {
      const errorData = await response.json(); 
      return { success: false, error: errorData.detail || response.statusText };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create job due to network issues" };
  }
}



// ----- Candidate Shortlisting ----- 
export async function updateShortlist(application_id: string, updateData: { shortlisted: boolean; shortlist_note: string; }) {
  try {
    const res = await fetch(`${API_BASE}/applications/${application_id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(updateData),
    });
    const data = await res.json();
    return data; 
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update shortlist" };
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

// ----- Authentication and User Management -----

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

//HM account creation
export const createHMAccount = async (userData: any) => {
  const token = localStorage.getItem("accessToken");
  if (!token) return { success: false, error: "Unauthorized: No token provided" };

  try {
    const response = await fetch(`${API_BASE}/users/hm`, {
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

//get all users
export const fetchAllUsers = async () => {
  const token = localStorage.getItem("accessToken");
  if (!token) return { success: false, error: "Unauthorized: No token provided" };

  try {
    const response = await fetch(`${API_BASE}/users`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Error fetching users:", errorData);
      return { success: false, error: errorData.error || `HTTP error! Status: ${response.status}` };
    }

    const users = await response.json();
    console.log("Fetched Users:", users);

    storeUserIds(users); 

    return { success: true, data: users };
  } catch (error) {
    console.error("Network error:", error);
    return { success: false, error: "Network error occurred" };
  }
};

// Store user IDs in localStorage
export const storeUserIds = (users: any[]) => {
  const userData = users.map(user => ({ id: user._id, email: user.email }));
  localStorage.setItem("userIds", JSON.stringify(userData));
  console.log("Stored user IDs in localStorage:", userData);
};

// Retrieve a user ID by email
export const getUserIdByEmail = (email: string): string | undefined => {
  const users = JSON.parse(localStorage.getItem("userIds") || "[]");
  const user = users.find((user: any) => user.email === email);
  return user ? user.id : undefined;
};



// Delete a user by ID (admin only)
export const deleteUser = async (userId: string, userRole: string) => {
  if (!userId) {
    console.error("Error: User ID is undefined");
    return { success: false, error: "Invalid user ID" };
  }

  // Prevent admin deletion
  if (userRole === "admin") {
    console.warn("Admin account cannot be deleted.");
    return { success: false, error: "Admin account cannot be deleted." };
  }

  const token = localStorage.getItem("accessToken");
  if (!token) {
    console.error("Unauthorized: No token provided");
    return { success: false, error: "Unauthorized: No token provided" };
  }

  console.log(`Deleting user with ID: ${userId}`);

  try {
    const response = await fetch(`${API_BASE}/users/${userId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error("Delete API Error:", data);
      return { success: false, error: data.error || `HTTP error! Status: ${response.status}` };
    }

    console.log("User deleted successfully");
    return { success: true, message: "User deleted successfully" };
  } catch (error) {
    console.error("Network error:", error);
    return { success: false, error: "Network error occurred" };
  }
};

export const bulkUpload = async (formData: FormData)=> {
  console.log("api called")
  console.log(formData)
  const url = `${API_BASE}/bulk/`;
  try {
    const headers = { ...getAuthHeaders()};
    const response = await fetch(`${API_BASE}/bulk/`, {
      method: "POST",
      body: formData,
      headers
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, error: errorData.error || "Bulk upload failed" };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Bulk upload failed:", error);
    return { success: false, error: "Bulk upload failed" };
  }
};

export async function getOpenJobs() {
  return getJobs(); // Reuse existing getJobs function
}

interface GeminiRecommendRequest {
  candidateSummary: string;
  jobs: any[];
}

export async function getGeminiRecommendations(request: GeminiRecommendRequest): Promise<Recommendation[]> {
  try {
    const API_KEY = "AIzaSyCjym5MYnST-sE9UdytGoTD8CxOGRJwpUM";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

    const prompt = `Analyze this candidate profile and the available job positions to recommend suitable matches. Follow these rules:
    
    
**Instructions:**

1.  **STRICT REQUIREMENT MATCHING:** Only recommend jobs where the candidate possesses the **key required skills**. If the candidate does not have a clear overlap with the essential skills, do not recommend the job.
2.  **Prioritize strong, complete matches:** Favor jobs where the candidate meets a significant portion, ideally all, of the **key required skills**.
3.  **Consider all aspects (but key skills are paramount):** While title, type, commitment, and location are important, the fulfillment of **key required skills** is the primary factor for recommendation.
4.  **Provide specific justification based on key skills:** For each recommendation, explicitly state which of the candidate's skills directly match the **key required skills** of the job.
5.  **Strict Output Format:** You MUST adhere to the following output format. If no jobs meet the strict criteria, you can indicate that in the "Analysis Summary."


**Candidate Profile:**
1. Candidate Summary: ${request.candidateSummary}
2. Available Jobs: ${JSON.stringify(request.jobs.map(job => ({
  title: job.title,
  type: job.description.type,
  commitment: job.description.commitment,
  location: job.description.location,
  required_skills: job.skills,
  responsibilities: job.description.responsibilities
})))}

Output format (strictly follow):
### Recommendations
{{ 1-3 job recommendations in this format }}

| Job Title | Location | Type | Match Reason |
|-----------|----------|------|--------------|
| [Job Title] | [Location] | [Job Type] | [Brief reason (1 sentence)] |

### Analysis Summary
[1-2 sentence summary of overall fit]`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      }),
    });

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Parse the structured response
    const recommendations: Recommendation[] = [];
    const rows = rawText.split('\n').filter((line: string) => line.startsWith('|'));
    
    for (const row of rows.slice(2)) { // Skip header
      const [_, title, location, type, reason] = row.split('|').map((c: string) => c.trim());
      if (title && reason ) {
        recommendations.push({
          title,
          location,
          type,
          reason
        });
      }
    }

    return recommendations;
  } catch (error) {
    console.error('Recommendation error:', error);
    return [];
  }
}

export interface Recommendation {
  title: string;
  location: string;
  type: string;
  reason: string;
}


// --------- shortlisting -----------------
export const createShortList = async (hiringManagerId: string, jobId: string) => {
  const url = `${API_BASE}/short_list/${encodeURIComponent(hiringManagerId)}?job_id=${encodeURIComponent(jobId)}`;

  try {
      const response = await fetch(url, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              ...getAuthHeaders() 
          },
          body: JSON.stringify({ job_id: jobId }) 
      });

      if (!response.ok) {
          throw new Error('Network response was not ok');
      }

      const result = await response.json();
      return result;
  } catch (error) {
      console.error('Error:', error);
      return { success: false, error: error.message };
  }
};


export const getShortlist = async () => {
 
  const hiringManagerId = localStorage.getItem('userId');
  const url = `${API_BASE}/short_list/${hiringManagerId}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',  ...getAuthHeaders() 
      }
    });

    const data = await response.json();
    return { success: true, data };
    
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Unknown network error occurred' };
  }
};


export const getShortlistByJob = async (jobId: string) => {
  const url = `${API_BASE}/short_list/job/${jobId}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/jsonrecommendations',  ...getAuthHeaders() 
      }
    });

    const short_list = await response.json();
    return { success: true, short_list };
    
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Unknown network error occurred' };
  }
};

// Add these to your existing api.ts

export const createRecommendation = async (jobId: string) => {
  const url = `${API_BASE}/recommendations`;

  try {
    console.log("Creating recommendation for job ID:", jobId);
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({ job_id: jobId })
    });

    const responseData = await response.json();  // Parse response once

    if (!response.ok) {
      // Server returned 4xx/5xx response
      console.error('API Error:', responseData);
      return responseData;  // Return server's error response directly
    }

    console.log("Recommendation created from api.tsx response:", responseData);
    return responseData;  // Return actual API response data

  } catch (error) {
    console.error('Network/Client Error:', error);
    return { 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      // Include additional error context if needed
      isNetworkError: !(error instanceof Error)
    };
  }
};
export const getRecommendationByJob = async (jobId: string) => {
  const url = `${API_BASE}/recommendations/${jobId}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch recommendations');
    }

    const data = await response.json();
    console.log('Response from api recommendation service:', data);
    return { success: true, recommendations: data };
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};