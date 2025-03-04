const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api/v1";

export async function startInterview(interviewId: string): Promise<{ session_id: string }> {
  const response = await fetch(`${API_BASE_URL}/interview/session/${interviewId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    }
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Interview not found");
  }
  return response.json();
}

export async function sendChat(sessionId: string, userAnswer: string): Promise<{ state: string; text: string }> {
  const response = await fetch(`${API_BASE_URL}/interview/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      session_id: sessionId,
      user_answer: userAnswer,
    })
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Error during chat");
  }
  return response.json();
}

// export async function endSession(sessionId: string): Promise<{ message: string }> {
//   // If you need to pass sessionId in the future, you can add it to the payload.
//   const response = await fetch(`${API_BASE_URL}/end_session`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json"
//     }
//   });
//   if (!response.ok) {
//     const errorData = await response.json();
//     throw new Error(errorData.detail || "Error ending session");
//   }
//   return response.json();
// }

  
  export async function endSession(sessionId: string): Promise<{ message: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ message: "Session ended" });
      }, 1000);
    });
  }
  