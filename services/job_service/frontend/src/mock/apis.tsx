const simulateDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export type Job = {
  _id: string;
  title: string;
  description: {
    type: string;
    summary: string;
    responsibilities: string;
    commitment: string
  };
  job_status: string; 
  skills: string[]; 
  postDate: string;
};

// const mockJobs: Job[] = [
//   {
//     _id: '1',
//     title: "Software Engineer",
//     description: {
//       type: 'inperson',
//       summary: "Design and develop backend services, APIs, and scalable infrastructure.",
//       responsibilities: 
//         `Bachelor’s degree in Computer Science or related field,
// 3+ years of experience in backend development,
// Proficiency in JavaScript, Node.js, or Python,
// Experience with cloud platforms (AWS, GCP, or Azure).`,
//       commitment: "full_time"
//     },
//     job_status: "Open",
//     skills: ["JavaScript", "Node.js", "Python", "AWS"],
//     postDate: "2024-03-01"
//   },
//   {
//     _id: '2',
//     title: "Frontend Developer",
//     description: {
//       type: "Remote",
//       summary: "Work closely with designers and backend developers to build intuitive and responsive user interfaces.",
//       responsibilities: 
//         `Bachelor’s degree in Computer Science or related field.
//         Experience with React, Next.js, or Vue.js.
//         Strong understanding of UI/UX principles.
//         Ability to write clean, maintainable CSS and JavaScript.`,
//        commitment: "internship"
//     },
//     job_status: "Open",
//     skills: ["React", "Next.js", "CSS", "JavaScript"],
//     postDate: "2024-02-28"
//   },
//   {
//     _id: '3',
//     title: "Data Scientist",
//     description: {
//       type: "hybrid",
//       summary: "Analyze complex datasets to extract valuable insights and drive business decisions. ",
//       responsibilities: 
//         `Master’s degree in Data Science, Statistics, or a related field.
//         Strong proficiency in Python and SQL.
//         Experience with machine learning frameworks (TensorFlow, PyTorch).
//         Familiarity with big data technologies like Spark and Hadoop.`,
//        commitment: "part_time"
//     },
//     job_status: "Closed",
//     skills: ["Python", "SQL", "Machine Learning", "TensorFlow"],
//     postDate: "2024-02-25"
//   }
// ];

// export const mockFetchJobs = async (): Promise<Job[]> => {
//   console.log("Fetching mock job data...");
//   await simulateDelay(500);
//   return mockJobs;
// };

// export const mockFetchJob = async (jobId: number): Promise<Job | null> => {
//   console.log(`Fetching mock job with ID: ${jobId}`);
//   await simulateDelay(500);
//   return mockJobs.find(job => job._id === String(jobId)) || null;
// };
