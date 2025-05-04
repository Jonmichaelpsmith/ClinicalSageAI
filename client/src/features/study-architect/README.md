# Study Architect Module

## Overview
The Study Architect module is a comprehensive solution for clinical study design, protocol optimization, and CSR intelligence. It provides researchers and clinical teams with AI-powered tools to improve study design, optimize protocols, and leverage insights from clinical study reports.

## Structure

```
study-architect/
├── components/       # Reusable components specific to Study Architect
├── pages/           # Page components that make up the module
│   └── StudyArchitectPage.jsx  # Main page implementation
└── index.jsx        # Entry point that exports the main component
```

## Integration Points

- App.jsx imports the module through the `./features/study-architect` path
- All routes in the application reference the unified component

## Dependencies

- UI Components: @/components/ui/*
- Study Components: @/components/studyArchitect/*
- Protocol Components: @/components/protocol/*
- CSR Components: @/components/csr-analyzer/*

## Usage

The module is accessible via two main routes:
- `/study-architect`
- `/client-portal/study-architect`

Both routes render the same component for a consistent user experience.
