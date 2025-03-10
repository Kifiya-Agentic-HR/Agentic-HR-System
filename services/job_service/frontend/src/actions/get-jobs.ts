export type Job = {
  _id: string;
  title: string;
  description: {
    type: string;
    summary: string;
    responsibilities: string;
    commitment: string;
  };
  job_status: string;
  skills: string[];
  postDate: string;
  created_at: string;
};


const jobTypeMap: Record<string, string> = {
  in_person: "In Person",
  inperson: "In Person",
  remote: "Remote",
  hybrid: "Hybrid",
};

const commitmentMap: Record<string, string> = {
  full_time: "Full Time",
  part_time: "Part Time",
  internship: "Internship",
};

//format job details
export function formatJobDetails(job: Job): Job {
  return {
    ...job,
    description: {
      ...job.description,
      type: jobTypeMap[job.description.type.toLowerCase()] || job.description.type, // Default to original if not mapped
      commitment: commitmentMap[job.description.commitment.toLowerCase()] || job.description.commitment,
    },
  };
}

// filter jobs
export async function findJobs({
  search,
  type,
  skills,
}: {
  search?: string;
  type?: string;
  skills?: string;
}): Promise<Job[]> {
  const jobs = await getJobs();

  
  return jobs
    .map(formatJobDetails) 
    .filter((job) => {
      const matchesSearch = search
        ? job.title.toLowerCase().includes(search.toLowerCase()) ||
          job.description.summary.toLowerCase().includes(search.toLowerCase())
        : true;

      const matchesType = type
        ? job.description.type.toLowerCase() === type.toLowerCase()
        : true;

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
    
    return (data.jobs || []).map(formatJobDetails); 
  } catch (error) {
    console.error("Failed to fetch jobs:", error);
    return [];
  }
}

// single job fetch 
export const getJob = async (jobId: string): Promise<Job | null> => {
  try {
    const url = `http://localhost:9000/jobs/${jobId}`;
    console.log(`Sending request to: ${url}`);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch job: ${response.statusText}`);
    }

    const data = await response.json();
    const job = data.job ? formatJobDetails(data.job) : null; 

    console.log("Job data:", job);
    return job;
  } catch (error) {
    console.error("Error fetching job:", error);
    return null;
  }
};
