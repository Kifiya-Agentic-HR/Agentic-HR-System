export interface Job {
    id: string;
    title: string;
    status: 'ongoing' | 'closed';
    type: string;
    summary: string;
  }
  
  export interface Application {
    id: string;
    name: string;
    cv_link: string;
    applied_date: string;
    screening_result: {
      status: 'passed' | 'failed' | 'pending';
      reasoning: string;
    };
    interview_result: {
      status: 'passed' | 'failed' | 'pending';
      reasoning: string;
    };
  }