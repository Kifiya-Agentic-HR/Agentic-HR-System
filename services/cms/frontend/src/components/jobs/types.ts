export interface Job {
    id: string;
    title: string;
    status: 'ongoing' | 'closed';
    applications: Application[];
  }
  
  export interface Application {
    _id: string;
    job_id: string;
    created_at: string;
    cv_link: string;
    application_status: 'pending' | 'hired' | 'rejected';
    candidate: {
      _id: string;
      full_name: string;
      email: string;
      phone_number: string;
      experience_years: string;
      disability: string;
      skills: string[];
      feedback: string;
    };
    screening: {
      _id: string;
      score: number;
      reasoning: Array<{
        criterion: string;
        evidence: string[];
        missing_elements: string[];
      }>;
      parsed_cv?: string;
      created_at: string;
    } | null;
    interview: {
      _id: string;
      interview_status: 'not-started' | 'scheduled' | 'completed' | 'flagged';
      interview_date?: string;
      hiring_decision?: 'Hire' | 'No Hire';
      interview_reasoning?: string;
      violations?: string;
      conversation_history?: string[];
      score?: number;
      skill_assessment?: Record<string, {
        score: number;
        required_level: string;
        number_of_questions: number;
        evidence: string;
      }>;
      created_at: string;
    } | null;
  }