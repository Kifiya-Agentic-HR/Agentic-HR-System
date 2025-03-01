const BASE_URL = process.env.INTERVIEW_BACKEND || 'http://localhost:8080';

interface ChatMessage {
    text: string;
    role: 'user' | 'interviewer';
  }
  
  interface SessionResponse {
    success: boolean;
    interviewId: string;
    sessionId: string | null;
    chatHistory: ChatMessage[];
    error?: string;
  }
  
  interface ChatResponse {
    success: boolean;
    state: 'welcome' | 'ongoing' | 'completed' | null;
    text: string;
    error?: string;
  }
  
interface InterviewResponse {
  success: boolean;
  status: 'scheduled' | 'completed' | 'expired' | 'flagged';
  error?: string;
}

  function parseChatHistory(history: string[]): ChatMessage[] {
    if (!Array.isArray(history)) return [];
  
    return history.map((entry) => {
      if (entry.startsWith('User: ')) {
        return {
          role: 'user',
          text: entry.slice('User: '.length).trim(),
        };
      }
      
      if (entry.startsWith('Interviewer: ')) {
        return {
          role: 'interviewer',
          text: entry.slice('Interviewer: '.length).trim(),
        };
      }
  
      // Fallback for unexpected formats
      console.warn('Unexpected chat message format:', entry);
      return {
        role: 'user',
        text: entry.trim(),
      };
    });
  }
  
  export async function createSession(interviewId: string): Promise<SessionResponse> {
    try {
      const response = await fetch(`/interview/session/${interviewId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      const data = await response.json();
  
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to create session');
      }
  
      return {
        success: true,
        interviewId: data.interview_id,
        sessionId: data.session_id,
        chatHistory: parseChatHistory(data.chat_history || []),
      };
    } catch (error) {
      console.error('Session creation error:', error);
      return {
        success: false,
        interviewId,
        sessionId: null,
        chatHistory: [],
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }
  
  export async function sendChatMessage(
    sessionId: string,
    userAnswer: string
  ): Promise<ChatResponse> {
    try {
      const response = await fetch('/interview/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
          user_answer: userAnswer,
        }),
      });
  
      const data = await response.json();
  
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to process chat message');
      }
  
      return {
        success: true,
        state: data.state,
        text: data.text,
      };
    } catch (error) {
      console.error('Chat error:', error);
      return {
        success: false,
        state: null,
        text: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

export async function getInterview(interviewId: string): Promise<InterviewResponse> {
  try {
    const response = await fetch(`/interview/${interviewId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Failed to get interview');
    }

    return {
      success: true,
      status: data.status,
      };

  } catch (error) {
    console.error('Interview fetch error:', error);
    return {
      success: false,
      status: 'expired',
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

// Save session ID to localStorage
export function saveSessionId(sessionId: string): void {
  try {
    localStorage.setItem('interviewSessionId', sessionId);
  } catch (error) {
    console.error('Error saving session ID:', error);
  }
}

// Get session ID from localStorage
export function getSessionId(): string | null {
  try {
    return localStorage.getItem('interviewSessionId');
  } catch (error) {
    console.error('Error retrieving session ID:', error);
    return null;
  }
}

// Remove session ID from localStorage
export function clearSessionId(): void {
  try {
    localStorage.removeItem('interviewSessionId');
  } catch (error) {
    console.error('Error clearing session ID:', error);
  }
}