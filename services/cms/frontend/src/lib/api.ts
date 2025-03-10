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
/*
   @param {Object} authData - The login credentials { email, password }.
 * @returns {Promise<Object>} - Expected response: { success: boolean, token?: string, userId?: string, role?: string, error?: string }
 */
   export async function login(authData: { email: string; password: string; }): Promise<{ success: boolean; token?: string; userId?: string; role?: string; error?: string; }> {
    try {
      const res = await fetch(`http://localhost:5050/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(authData),
      });
  
      // Log the response status for debugging
      console.log("🔵 [Frontend] Login response status:", res.status);
  
      if (!res.ok) {
        let errorMsg = "Failed to login";
        try {
          const errorData = await res.json();
          errorMsg = errorData.error || errorMsg;
        } catch (jsonError) {
          const errorText = await res.text();
          errorMsg = errorText || errorMsg;
        }
        console.error("❌ [Frontend] Login error response:", errorMsg, res.status);
        return { success: false, error: errorMsg };
      }
  
      // Parse the JSON response from the backend
      const data = await res.json();
      console.log("🟢 [Frontend] Login successful:", data);
  
      // Extract token and decode it
      const token = data.access_token;
      const decodedToken = JSON.parse(atob(token.split(".")[1])); // Decode JWT payload
      const userId = decodedToken.sub; // Extract user ID
      const role = decodedToken.role; // Extract user role
  
      if (!userId || !role) {
        console.error("❌ [Frontend] Invalid token: Missing userId or role.");
        return { success: false, error: "Invalid token structure." };
      }
  
      // ✅ Save token, userId, and role to localStorage
      localStorage.setItem("accessToken", token);
      localStorage.setItem("userId", userId);
      localStorage.setItem("userRole", role);
  
      console.log("🟢 [Frontend] Saved to localStorage:", { token, userId, role });
  
      return { success: true, token, userId, role };
    } catch (error: unknown) {
      let errorMessage = "Failed to login";
      if (error instanceof Error && error.message) {
        errorMessage = error.message;
      }
      console.error("❌ [Frontend] Error in login fetch:", error);
      return { success: false, error: errorMessage };
    }
  }
  


  export const createHRAccount = async (userData: any) => {
    const token = localStorage.getItem("accessToken");
  
    console.log(" [Frontend] Starting HR account creation...");
    console.log("[Frontend] Retrieved Token:", token);
  
    if (!token) {
      console.error("[Frontend] No authentication token found");
      return { success: false, error: "Unauthorized: No token provided" };
    }
  
    console.log("[Frontend] Sending request with payload:", JSON.stringify(userData));
  
    try {
      const response = await fetch(`http://localhost:5050/users/hr`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });
  
      console.log("[Frontend] Response received. Status:", response.status);
  
      if (!response.ok) {
        let errorMsg = `HTTP error! Status: ${response.status}`;
  
        try {
          const errorData = await response.json();
          errorMsg = errorData.error || errorMsg;
          console.error("[Frontend] Backend returned an error:", errorMsg);
        } catch (jsonError) {
          const errorText = await response.text();
          errorMsg = errorText || errorMsg;
          console.error("[Frontend] Could not parse error response:", errorMsg);
        }
  
        return { success: false, error: errorMsg };
      }
  
      const data = await response.json();
      console.log("[Frontend] HR Account Created Successfully:", data);
      return { success: true, data };
    } catch (error: unknown) {
      let errorMessage = "[Frontend] Network error occurred during fetch";
  
      if (error instanceof Error) {
        errorMessage = error.message;
      }
  
      console.error("[Frontend] Network Error:", errorMessage);
      return { success: false, error: errorMessage };
    }
  };
  

  export const updateOwnAccount = async (userData: any) => {
    const token = localStorage.getItem("accessToken");
    const userId = localStorage.getItem("userId"); // ✅ Get user ID from localStorage
  
    console.log("🔵 [Frontend] Starting user account update...");
    console.log("🟡 [Frontend] Retrieved Token:", token);
    console.log("🟡 [Frontend] Retrieved User ID:", userId);
  
    if (!token || !userId) {
      console.error("❌ [Frontend] No authentication token or user ID found");
      return { success: false, error: "Unauthorized: No token or user ID provided" };
    }
  
    // ✅ Build request dynamically (excluding `email`, ensuring `password` is included)
    const requestData: Record<string, any> = {
      password: userData.newPassword, // ✅ Send `currentPassword` as `password`
    };
  
    // ✅ Include `firstName` & `lastName` **only if they exist** (for HR users)
    if (userData.firstName) requestData.firstName = userData.firstName;
    if (userData.lastName) requestData.lastName = userData.lastName;
  
    console.log("🟡 [Frontend] Adjusted Request Payload:", JSON.stringify(requestData));
  
    try {
      const response = await fetch(`http://localhost:5050/users/${userId}/self`, {
        method: "PATCH", // ✅ Using PATCH as per backend change
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(requestData),
      });
  
      console.log("🟡 [Frontend] Response received. Status:", response.status);
  
      if (!response.ok) {
        let errorMsg = `HTTP error! Status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMsg = errorData.error || JSON.stringify(errorData); // Log full error message
          console.error("❌ [Frontend] Backend returned an error:", errorMsg);
        } catch (jsonError) {
          const errorText = await response.text();
          errorMsg = errorText || errorMsg;
          console.error("❌ [Frontend] Could not parse error response:", errorMsg);
        }
  
        return { success: false, error: errorMsg };
      }
  
      const data = await response.json();
      console.log("🟢 [Frontend] User Account Updated Successfully:", data);
      return { success: true, data };
    } catch (error: unknown) {
      console.error("❌ [Frontend] Network Error:", error);
      return { success: false, error: "Network error occurred" };
    }
  };
  