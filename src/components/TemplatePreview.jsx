import StandardFormat from "./StandardFormat";

const SAMPLE_CV = {
  name: "John Doe",
  title: "Senior Software Engineer",
  email: "john@example.com",
  phone: "+1 555 0123",
  location: "San Francisco, CA",
  linkedin: "linkedin.com/in/johndoe",
  spokenLanguages: ["English - Native", "Spanish - Advanced", "French - Intermediate"],
  skills: ["React", "TypeScript", "Node.js", "Python", "AWS", "Docker", "GraphQL", "PostgreSQL"],
  education: [
    { degree: "M.S. Computer Science", institution: "Stanford University", year: "2018" },
    { degree: "B.S. Software Engineering", institution: "UC Berkeley", year: "2016" },
  ],
  certifications: [
    { name: "AWS Solutions Architect", issuer: "Amazon", year: "2023" },
  ],
  experience: [
    {
      company: "Tech Corp",
      role: "Senior Software Engineer",
      from: "Jan 2022",
      to: "Present",
      responsibilities: [
        "Led migration of monolith to microservices architecture",
        "Designed and implemented CI/CD pipelines reducing deploy time by 60%",
        "Mentored team of 5 junior developers",
      ],
    },
    {
      company: "StartupXYZ",
      role: "Full Stack Developer",
      from: "Mar 2019",
      to: "Dec 2021",
      responsibilities: [
        "Built real-time collaboration features serving 10K+ users",
        "Optimized database queries improving response time by 40%",
      ],
    },
  ],
};

export default function TemplatePreview() {
  return <StandardFormat cv={SAMPLE_CV} />;
}
