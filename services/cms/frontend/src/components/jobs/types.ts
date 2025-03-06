export interface Job {
    id: string;
    title: string;
    status: 'ongoing' | 'closed';
    applications: Application[];
  }
  
  export interface Application {
    id: string;
    candidateName: string;
    cvLink: string;
    appliedDate: string;
    screening: {
      status: 'pending' | 'passed' | 'rejected';
      reasoning?: string;
      updatedAt?: string;
    };
    interview: {
      status: 'not-started' | 'scheduled' | 'completed' | 'hired' | 'rejected';
      reasoning?: string;
      updatedAt?: string;
    };
  }