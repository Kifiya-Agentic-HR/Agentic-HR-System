import { Job } from "@/mock/apis";

export async function findJobs({
  search,
  type,
  skills,
}: {
  search?: string;
  type?: string;
  skills?: string;
}): Promise<Job[]> {
  // Fetch all jobs from the backend
  const jobs = await getJobs();

  // Filter jobs based on search parameters
  return jobs.filter((job) => {
    // Match search keyword in job title or description summary
    const matchesSearch = search
      ? job.title.toLowerCase().includes(search.toLowerCase()) ||
        job.description.summary.toLowerCase().includes(search.toLowerCase())
      : true;

    // Match job type (remote, hybrid, in-person)
    const matchesType = type
      ? job.description.type.toLowerCase() === type.toLowerCase()
      : true;

    // Match skills (comma-separated list)
    const matchesSkills = skills
      ? skills
          .toLowerCase()
          .split(",")
          .every((skill) =>
            job.skills.map((s) => s.toLowerCase()).includes(skill.trim())
          )
      : true;

    return matchesSearch && matchesType && matchesSkills;
  });
}


export async function getJobs(): Promise<Job[]> {
  try {
    const response = await fetch("http://localhost:9000/jobs/"); 
    if (!response.ok) {
      throw new Error(`Error fetching jobs: ${response.statusText}`);
    }

    const data = await response.json();
    
    return data.jobs || []; 
  } catch (error) {
    console.error("Failed to fetch jobs:", error);
    return []; 
  }
}

export const getJob = async (jobId: string): Promise<Job | null> => {
  try {
    const url = `http://localhost:9000/jobs/${jobId}`;
    console.log(`Sending request to: ${url}`);  

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch job: ${response.statusText}`);
    }

    const data = await response.json();

 
    const job = data.job || null; 

    console.log('Job data:', job); 
    return job;
  } catch (error) {
    console.error('Error fetching job:', error);
    return null;
  }
};