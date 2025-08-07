export interface Job {
    _id?: string;
    id: string;
    title: string;
    job_status: 'ongoing' | 'closed' |string;
    applications: Application[];
    created_at: string;
  }

  export interface Recommendation {
    title: string;
    location: string;
    type: string;
    reason: string;
  }


  export interface ApplicationInvitePayload {
    to: string;
    title: string;
    type: 'application_invite';
    subject: string;
    name: string;
    apply_link: string;
  }
  
  
  
  export interface ShortList {
    _id: string;
    job_id: string;
    hiring_manager_id: string;
    created_at: string;
  }
  
  export interface ShortlistResponse {
    success: boolean;
    data?: {
      short_list: ShortList[];
    };
    error?: string;
  }
  export interface RecommendationResponse {
    _id: string;
    application_id: string;
    full_name: string;
    email: string;
    reasoning: string;
    score: number;
    cv_link: string;
    created_at: string;}

  export type User = {
   // id: string;
    _id: string;
    role: "hr" | "hm" | "admin";
    firstName: string;
    lastName: string;
    email: string;
  };
  
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
      gender: string;
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
        score?: number;
        rating: number;
        required_level: string;
        number_of_questions: number;
        evidence: string;
      }>;
      created_at: string;
    } | null;
    shortlisted?: boolean;
    shortlist_comments?: Comment[];
  }

  interface Comment {
    comment: string;
    user: string;
    timestamp: string;
  }