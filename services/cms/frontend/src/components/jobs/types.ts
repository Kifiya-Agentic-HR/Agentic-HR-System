export interface Job {
    id: string;
    title: string;
    status: 'ongoing' | 'closed';
    applications: Application[];
  }
  
  export interface Application {
    _id: string;
    cv_link: string;
    created_at: string;
    screening: {
      status: 'pending' | 'passed' | 'rejected';
      reasoning?: string;
      updatedAt?: string;
    } | null;
    interview: {
      interview_status: 'not-started' | 'scheduled' | 'completed' | 'hired' | 'rejected';
      hiring_decision?: string;
      interview_reasoning?: string;
      reasoning?: string;
      updatedAt?: string;

    } | null;
    candidate: {
      _id: string;
      email: string;
      phone_number: string;
      experience_years: string;
      feedback: string;
      full_name: string;
      disability: string;
      skills: string[];
    }
  }