import { Job, mockFetchJobs, mockFetchJob } from "@/mock/apis";

export async function getJob(jobId: number): Promise<Job | null> {
  return await mockFetchJob(jobId);
}

export async function getJobs({ search, type, skills }: { search?: string; type?: string; skills?: string }): Promise<Job[]> {
  const jobs = await mockFetchJobs();
  return jobs.filter(job => {
    const matchesSearch = search ? job.title.toLowerCase().includes(search.toLowerCase()) || job.description.summary.toLowerCase().includes(search.toLowerCase()) : true;
    const matchesType = type ? job.description.type.toLowerCase() === type.toLowerCase() : true;
    const matchesSkills = skills ? skills.toLowerCase().split(',').every(skill => job.skills.map(s => s.toLowerCase()).includes(skill.trim().toLowerCase())) : true;
    return matchesSearch && matchesType && matchesSkills;
  });
}