// /server/routes/projectsStatus.js

import express from 'express';
const router = express.Router();

// Sample project status data - in a real app, this would come from a database
const projectsData = [
  {
    id: 1,
    name: "Enzyvant BLA",
    status: "In Progress",
    completion: 65,
    priority: "High",
    deadline: "2025-06-15",
    assignee: "Sarah Johnson",
    modules: ["IND Wizard", "CSR Analysis"]
  },
  {
    id: 2,
    name: "Axogen CMC",
    status: "On Hold",
    completion: 30,
    priority: "Medium",
    deadline: "2025-07-23",
    assignee: "Michael Chen",
    modules: ["CMC Module", "Study Architect"]
  },
  {
    id: 3,
    name: "Pfizer CER",
    status: "Completed",
    completion: 100,
    priority: "Low",
    deadline: "2025-05-01",
    assignee: "Jessica Miller",
    modules: ["CER Generator"]
  },
  {
    id: 4,
    name: "Novartis IND",
    status: "In Review",
    completion: 85,
    priority: "High",
    deadline: "2025-05-30",
    assignee: "Robert Taylor",
    modules: ["IND Wizard", "Vault"]
  },
  {
    id: 5,
    name: "Merck PMDA",
    status: "In Progress",
    completion: 45,
    priority: "Medium",
    deadline: "2025-08-15",
    assignee: "Amanda Lee",
    modules: ["Analytics", "Vault"]
  }
];

// GET all projects status
router.get('/status', (req, res) => {
  res.json(projectsData);
});

// GET single project status
router.get('/status/:id', (req, res) => {
  const project = projectsData.find(p => p.id === parseInt(req.params.id));
  if (!project) {
    return res.status(404).json({ message: 'Project not found' });
  }
  res.json(project);
});

export default router;