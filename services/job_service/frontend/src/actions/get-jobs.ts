import { Job, mockFetchJobs, mockFetchJob } from "@/mock/apis"; 

export async function getJobs(): Promise<Job[]> {
  return await mockFetchJobs();
}

export async function getJob(jobId: number): Promise<Job | null> {
  return await mockFetchJob(jobId);
}


// export async function getJobs(): Promise<Job[]> {
//   try {
//     const response = await fetch("api_here"); // API URL
//     if (!response.ok) {
//       throw new Error(`Error fetching jobs: ${response.statusText}`);
//     }
//     return await response.json();
//   } catch (error) {
//     console.error("Failed to fetch jobs:", error);
//     return []; // Return an empty array in case of failure
//   }
// }

// export async function getJob(jobId: number): Promise<Job | null> {
//   try {
//     const response = await fetch(`api_here`); // API URL
//     if (!response.ok) {
//       throw new Error(`Error fetching job: ${response.statusText}`);
//     }
//     return await response.json();
//   } catch (error) {
//     console.error(`Failed to fetch job ${jobId}:`, error);
//     return null; // Return null if the job is not found or an error occurs
//   }
// }
