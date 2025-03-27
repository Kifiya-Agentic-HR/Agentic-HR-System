import { Job, Application } from "./types";

const generateApplications = (count: number): Application[] => {
  const statuses = ['pending', 'passed', 'rejected'];
  return Array.from({ length: count }, (_, i) => ({
    id: `app-${i + 1}`,
    candidateName: `Candidate ${i + 1}`,
    cvLink: `/cv/candidate-${i + 1}.pdf`,
    appliedDate: new Date(Date.now() - i * 86400000).toISOString(), 
    screening: {
      status: statuses[i % 3] as any,
      reasoning: i % 2 === 0 ? 'Strong technical background' : 'Missing required experience',
      updatedAt: new Date().toISOString()
    },
    interview: {
      status: 'not-started',
      updatedAt: new Date().toISOString()
    }
  }));
};

export const fetchOngoingJobs = async (): Promise<Job[]> => {
  return [
    {
      id: 'job-1',
      title: 'Senior Frontend Developer',
      status: 'ongoing',
      applications: generateApplications(4)
    },
    {
      id: 'job-2',
      title: 'UX Designer',
      status: 'ongoing',
      applications: generateApplications(4)
    },
    {
      id: 'job-3',
      title: 'Backend Engineer',
      status: 'ongoing',
      applications: generateApplications(4)
    },
    {
      id: 'job-4',
      title: 'Product Manager',
      status: 'ongoing',
      applications: generateApplications(4)
    }
  ];
};


export const updateApplicationStatus = async (
  applicationId: string, 
  type: 'screening' | 'interview', 
  status: string, 
  reasoning?: string
) => {
  console.log(`Updating ${type} status for ${applicationId} to ${status}`);
  return { success: true };
};