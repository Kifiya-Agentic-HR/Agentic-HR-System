import { Job, Application } from './types';

const mockJobs: Job[] = [
    { 
      id: '1', 
      title: 'Senior React Developer',
      status: 'ongoing',
      type: 'Full-time',
      summary: 'Join our frontend team to build modern web applications.'
    },
    { 
      id: '2', 
      title: 'UX Designer',
      status: 'ongoing',
      type: 'Contract',
      summary: 'Design intuitive user experiences for our enterprise applications.'
    },
    // Add more mock jobs...
  ];
  
  const mockApplications: { [key: string]: Application[] } = {
    "1": [
      {
        id: 'a1',
        name: 'John Doe',
        cv_link: '/dummy-cv.pdf',
        applied_date: '2024-03-15',
        screening_result: { status: 'passed', reasoning: 'Strong React experience' },
        interview_result: { status: 'pending', reasoning: '' }
      },
      // More applications...
    ],
    "2": [
      {
        id: 'a2',
        name: 'Jane Smith',
        cv_link: '/dummy-cv.pdf',
        applied_date: '2024-03-20',
        screening_result: { status: 'pending', reasoning: '' },
        interview_result: { status: 'pending', reasoning: '' }
      },
    ],
  };
// Fetch job posts
export const fetchJobs = async (): Promise<Job[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockJobs);
    }, 500); // Simulate network delay
  });
};

// Fetch applications for a specific job
export const fetchApplications = async (jobId: string): Promise<Application[]> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const applications = mockApplications[jobId];
      if (applications) {
        resolve(applications);
      } else {
        reject(new Error('Job not found'));
      }
    }, 500); // Simulate network delay
  });
};