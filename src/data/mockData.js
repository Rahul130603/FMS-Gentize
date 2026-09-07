// Mock Data for Book Publishing Management System (FMS)

export const CURRENT_USER = {
  id: 'USR-8821',
  name: 'Pradhap Kumar',
  role: 'Senior Digital Production Lead',
  department: 'Digital Publishing & Accessibility',
  avatar: 'PK',
  email: 'pradhap.k@pubflow.com',
};

export const PUBLISHING_CLIENTS = [
  'ABC Publishing',
  'XYZ Books',
  'Oxford Academic',
  'Cambridge University Press',
  'Pearson Education',
  'Elsevier Health',
  'Springer Nature',
  'HarperCollins Learning',
  'Sage Publications',
  'Routledge Academic'
];

export const PROJECT_TYPES = [
  'EPUB',
  'PDF',
  'XML',
  'Accessibility',
  'Print',
  'Conversion'
];

export const MY_REPORT_STATUSES = [
  'Not Started',
  'In Progress',
  'Review',
  'Completed',
  'On Hold'
];

export const INCOMING_STATUSES = [
  'New',
  'Under Review',
  'Ready for Assignment',
  'Assigned',
  'In Production'
];

export const PRODUCTION_STAGES = [
  'Manuscript',
  'Pre-Production',
  'Conversion',
  'QA',
  'Accessibility',
  'Final Review',
  'Delivery'
];

export const PRODUCTION_TEAMS = [
  'Digital Conversion Team A',
  'Accessibility Remediation Unit',
  'XML & Pre-Press Division',
  'STEM Math Typesetting Squad',
  'Editorial Quality Assurance',
  'Global Distribution Team'
];

export const TEAM_MEMBERS = [
  { id: 'USR-101', name: 'John Doe', role: 'Conversion Specialist', team: 'Digital Conversion Team A' },
  { id: 'USR-102', name: 'Sarah Chen', role: 'Accessibility Lead', team: 'Accessibility Remediation Unit' },
  { id: 'USR-103', name: 'Robert Taylor', role: 'XML Pre-Press Engineer', team: 'XML & Pre-Press Division' },
  { id: 'USR-104', name: 'Priya Patel', role: 'MathJax & Alt-Text QA', team: 'STEM Math Typesetting Squad' },
  { id: 'USR-105', name: 'Emily Davis', role: 'Lead Editorial Inspector', team: 'Editorial Quality Assurance' },
  { id: 'USR-8821', name: 'Pradhap Kumar', role: 'Senior Digital Production Lead', team: 'Digital Publishing & Accessibility' }
];

export const INITIAL_MY_PROJECTS = [
  {
    id: 'PRJ-1011',
    bookTitle: 'Advanced Organic Chemistry: Principles & Mechanisms',
    client: 'Oxford Academic',
    projectType: 'Accessibility',
    assignedDate: '2026-08-18',
    dueDate: '2026-09-04', // Today
    progress: 92,
    currentStage: 'Accessibility',
    status: 'In Progress',
    priority: 'High',
    author: 'Dr. Evelyn Reed & Marcus Vance',
    isbn: '9783820471694',
    edition: '5th Global Edition',
    description: 'WCAG 2.1 AA full remediation with MathML conversion for 1,420 chemical formulas and high-resolution structural diagrams.',
    assignedBy: 'Elena Rostova (Publishing Director)'
  },
  {
    id: 'PRJ-1012',
    bookTitle: 'Global Economics & Trade Policy in Modern Era',
    client: 'Pearson Education',
    projectType: 'EPUB',
    assignedDate: '2026-08-20',
    dueDate: '2026-09-04', // Today
    progress: 85,
    currentStage: 'Final Review',
    status: 'Review',
    priority: 'High',
    author: 'Prof. Jonathan Sterling',
    isbn: '9783820471694',
    edition: '3rd Edition',
    description: 'Reflowable EPUB 3.3 production with interactive charting, responsive tables, and synchronised media overlays.',
    assignedBy: 'Elena Rostova'
  },
  {
    id: 'PRJ-1008',
    bookTitle: 'Clinical Neurology: Case Studies & Diagnostics',
    client: 'Elsevier Health',
    projectType: 'XML',
    assignedDate: '2026-08-10',
    dueDate: '2026-08-30', // Overdue
    progress: 78,
    currentStage: 'QA',
    status: 'In Progress',
    priority: 'High',
    author: 'Dr. Aris Thorne, MD',
    isbn: '9783820469004',
    edition: '2nd Illustrated Edition',
    description: 'JATS XML 1.3 DTD schema validation, medical imagery color-check, and cross-reference hyperlinking.',
    assignedBy: 'Markus Weber'
  },
  {
    id: 'PRJ-1009',
    bookTitle: 'Microbiology Fundamentals for Health Science',
    client: 'Springer Nature',
    projectType: 'Conversion',
    assignedDate: '2026-08-14',
    dueDate: '2026-09-02', // Overdue
    progress: 60,
    currentStage: 'Conversion',
    status: 'In Progress',
    priority: 'Medium',
    author: 'Claire D. Simmons',
    isbn: '9783631462171',
    edition: '1st Edition',
    description: 'Legacy Word and InDesign conversion to structured XML and dual-format print-ready PDF.',
    assignedBy: 'Elena Rostova'
  },
  {
    id: 'PRJ-1014',
    bookTitle: 'Introduction to Modern Quantum Mechanics',
    client: 'Cambridge University Press',
    projectType: 'PDF',
    assignedDate: '2026-08-25',
    dueDate: '2026-09-12',
    progress: 45,
    currentStage: 'Pre-Production',
    status: 'In Progress',
    priority: 'Medium',
    author: 'David J. Griffiths & Darrell Schroeter',
    isbn: '9783631447543',
    edition: '4th Edition',
    description: 'Interactive PDF/UA-1 compliant with complex mathematical tagging and screen reader bookmarks.',
    assignedBy: 'Markus Weber'
  },
  {
    id: 'PRJ-1015',
    bookTitle: 'Contemporary World Literature Anthology',
    client: 'HarperCollins Learning',
    projectType: 'Print',
    assignedDate: '2026-08-28',
    dueDate: '2026-09-18',
    progress: 30,
    currentStage: 'Manuscript',
    status: 'In Progress',
    priority: 'Low',
    author: 'Siddhartha Mukherjee & Colleague Editors',
    isbn: '9783631463949',
    edition: '1st Edition',
    description: 'Hardcover print interior layout with multilingual diacritics and custom typography grid.',
    assignedBy: 'Elena Rostova'
  },
  {
    id: 'PRJ-1002',
    bookTitle: 'Artificial Intelligence & Machine Learning in Practice',
    client: 'ABC Publishing',
    projectType: 'EPUB',
    assignedDate: '2026-08-01',
    dueDate: '2026-08-24',
    progress: 100,
    currentStage: 'Delivery',
    status: 'Completed',
    priority: 'High',
    author: 'K. Subramanian & Lin Zhang',
    isbn: '9783906759999',
    edition: '2nd Edition',
    description: 'Fixed-layout and reflowable EPUB with high accessibility score and embedded code snippets.',
    assignedBy: 'Elena Rostova'
  },
  {
    id: 'PRJ-1004',
    bookTitle: 'Child Psychology: Development & Behavior',
    client: 'XYZ Books',
    projectType: 'Accessibility',
    assignedDate: '2026-08-05',
    dueDate: '2026-08-26',
    progress: 100,
    currentStage: 'Delivery',
    status: 'Completed',
    priority: 'Medium',
    author: 'Laura E. Berk',
    isbn: '9783631495896',
    edition: '9th Edition',
    description: 'Full DAISY and EPUB Accessibility 1.1 certification with synthetic voice testing.',
    assignedBy: 'Markus Weber'
  },
  {
    id: 'PRJ-1018',
    bookTitle: 'Financial Accounting & Reporting Standards',
    client: 'Pearson Education',
    projectType: 'XML',
    assignedDate: '2026-09-01',
    dueDate: '2026-09-22',
    progress: 15,
    currentStage: 'Pre-Production',
    status: 'Not Started',
    priority: 'Medium',
    author: 'Barry J. Epstein & Abbas Ali Mirza',
    isbn: '9783631463062',
    edition: '7th Edition',
    description: 'XBRL-compatible XML structure tagging and financial table standardization.',
    assignedBy: 'Elena Rostova'
  },
  {
    id: 'PRJ-1020',
    bookTitle: 'Environmental Science: Systems and Solutions',
    client: 'Routledge Academic',
    projectType: 'Conversion',
    assignedDate: '2026-08-22',
    dueDate: '2026-09-15',
    progress: 50,
    currentStage: 'Conversion',
    status: 'On Hold',
    priority: 'Low',
    author: 'Michael L. McKinney & Robert Schoch',
    isbn: '9783261042583',
    edition: '6th Edition',
    description: 'Project paused awaiting publisher copyright clearance on third-party cartographic figures.',
    assignedBy: 'Markus Weber'
  },
  {
    id: 'PRJ-1022',
    bookTitle: 'Principles of Macroeconomics & Fiscal Policy',
    client: 'Pearson Education',
    projectType: 'EPUB',
    assignedDate: '2026-08-26',
    dueDate: '2026-09-16',
    progress: 40,
    currentStage: 'Conversion',
    status: 'In Progress',
    priority: 'Medium',
    author: 'N. Gregory Mankiw',
    isbn: '9783631447390',
    edition: '8th Edition',
    description: 'Interactive EPUB with dynamic supply-demand modeling and formula voiceover.',
    assignedBy: 'Elena Rostova'
  }
];

export const INITIAL_INCOMING_PROJECTS = [
  {
    id: 'PRJ-1024',
    bookTitle: 'Biology Fundamentals',
    client: 'ABC Publishing',
    format: 'EPUB',
    projectType: 'EPUB',
    receivedDate: '2026-09-04',
    dueDate: '2026-09-10',
    priority: 'High',
    assignedTo: 'Unassigned',
    assignedTeam: null,
    assignedUserId: null,
    startDate: null,
    notes: '',
    status: 'New',
    author: 'Dr. Neil A. Campbell & Jane B. Reece',
    publisher: 'ABC Publishing',
    isbn: '978-0-321-77565-8',
    edition: '12th Global Edition',
    language: 'English (US)',
    bookType: 'Higher Education Textbook',
    requirements: {
      outputFormat: 'EPUB 3.3 (Reflowable) + Web-Ready PDF',
      accessibilityRequired: 'Yes',
      accessibilityStandard: 'WCAG 2.1 Level AA & EPUB Accessibility 1.1',
      mathFormulaContent: 'Low (64 inline formulas)',
      imageFigureCount: 342,
      tableCount: 48,
      chapterCount: 26
    },
    sourceFiles: [
      { name: 'Biology_Manuscript_Final_Rev.docx', type: 'Word', size: '24.6 MB', uploadDate: '2026-09-04 09:15 AM', downloadUrl: '#' },
      { name: 'Figures_HighRes_Archive.zip', type: 'Images', size: '184.2 MB', uploadDate: '2026-09-04 09:20 AM', downloadUrl: '#' },
      { name: 'Cover_Design_Template.indd', type: 'InDesign', size: '42.1 MB', uploadDate: '2026-09-04 09:22 AM', downloadUrl: '#' },
      { name: 'Editorial_Styling_Guidelines.pdf', type: 'PDF', size: '3.8 MB', uploadDate: '2026-09-04 09:25 AM', downloadUrl: '#' }
    ],
    timeline: [
      { stage: 'Project Received', date: '2026-09-04 09:15 AM', status: 'completed' },
      { stage: 'Requirement Review', date: '2026-09-04 11:30 AM', status: 'current' },
      { stage: 'Ready for Assignment', date: 'Pending Review', status: 'upcoming' },
      { stage: 'Assigned', date: 'Unassigned', status: 'upcoming' },
      { stage: 'Production', date: 'Pending Assignment', status: 'upcoming' },
      { stage: 'QA', date: 'TBD', status: 'upcoming' },
      { stage: 'Final Delivery', date: 'Target: 2026-09-10', status: 'upcoming' }
    ]
  },
  {
    id: 'PRJ-1025',
    bookTitle: 'Modern History & Geopolitics',
    client: 'XYZ Books',
    format: 'PDF',
    projectType: 'PDF',
    receivedDate: '2026-09-04',
    dueDate: '2026-09-12',
    priority: 'Medium',
    assignedTo: 'John Doe',
    assignedTeam: 'Digital Conversion Team A',
    assignedUserId: 'USR-101',
    startDate: '2026-09-05',
    notes: 'Prioritize index cross-references and colored military map overlays.',
    status: 'Assigned',
    author: 'Prof. Eric Hobsbawm & Alan Palmer',
    publisher: 'XYZ Books',
    isbn: '978-0-14-013561-9',
    edition: 'Rev. 2026 Edition',
    language: 'English (UK)',
    bookType: 'Monograph / Trade Non-Fiction',
    requirements: {
      outputFormat: 'Interactive PDF/UA-1 + Print Master',
      accessibilityRequired: 'Yes',
      accessibilityStandard: 'PDF/UA-1 & Section 508',
      mathFormulaContent: 'None',
      imageFigureCount: 118,
      tableCount: 22,
      chapterCount: 14
    },
    sourceFiles: [
      { name: 'Modern_History_Complete.indd', type: 'InDesign', size: '89.4 MB', uploadDate: '2026-09-04 08:30 AM', downloadUrl: '#' },
      { name: 'Cartography_Vector_Maps.zip', type: 'Images', size: '64.1 MB', uploadDate: '2026-09-04 08:32 AM', downloadUrl: '#' },
      { name: 'Index_Terms_Metadata.xml', type: 'XML', size: '1.2 MB', uploadDate: '2026-09-04 08:35 AM', downloadUrl: '#' }
    ],
    timeline: [
      { stage: 'Project Received', date: '2026-09-04 08:30 AM', status: 'completed' },
      { stage: 'Requirement Review', date: '2026-09-04 10:00 AM', status: 'completed' },
      { stage: 'Ready for Assignment', date: '2026-09-04 11:15 AM', status: 'completed' },
      { stage: 'Assigned', date: '2026-09-04 01:45 PM', status: 'completed' },
      { stage: 'Production', date: 'Starts 2026-09-05', status: 'upcoming' },
      { stage: 'QA', date: 'Target: 2026-09-10', status: 'upcoming' },
      { stage: 'Final Delivery', date: 'Target: 2026-09-12', status: 'upcoming' }
    ]
  },
  {
    id: 'PRJ-1026',
    bookTitle: 'Physics Basics & Mechanics with Lab Manual',
    client: 'ABC Publishing',
    format: 'EPUB + A11y',
    projectType: 'Accessibility',
    receivedDate: '2026-09-03',
    dueDate: '2026-09-08',
    priority: 'High',
    assignedTo: 'Unassigned',
    assignedTeam: null,
    assignedUserId: null,
    startDate: null,
    notes: '',
    status: 'Ready for Assignment',
    author: 'Halliday, Resnick & Jearl Walker',
    publisher: 'ABC Publishing',
    isbn: '978-1-118-23072-5',
    edition: '11th Standard Edition',
    language: 'English (US)',
    bookType: 'Undergraduate STEM Coursebook',
    requirements: {
      outputFormat: 'Accessible EPUB 3 + NIMAS Standard XML',
      accessibilityRequired: 'Yes',
      accessibilityStandard: 'WCAG 2.1 Level AAA (Strict MathML alt-text)',
      mathFormulaContent: 'High (840 equations)',
      imageFigureCount: 512,
      tableCount: 65,
      chapterCount: 32
    },
    sourceFiles: [
      { name: 'Physics_Vol1_LaTeX_Source.zip', type: 'Word', size: '54.2 MB', uploadDate: '2026-09-03 14:10 PM', downloadUrl: '#' },
      { name: 'Physics_Vector_Diagrams.ai', type: 'Images', size: '98.5 MB', uploadDate: '2026-09-03 14:15 PM', downloadUrl: '#' },
      { name: 'Math_Equations_MathML_Source.xml', type: 'XML', size: '4.8 MB', uploadDate: '2026-09-03 14:18 PM', downloadUrl: '#' },
      { name: 'Client_Brief_Specifications.pdf', type: 'PDF', size: '1.5 MB', uploadDate: '2026-09-03 14:20 PM', downloadUrl: '#' }
    ],
    timeline: [
      { stage: 'Project Received', date: '2026-09-03 14:10 PM', status: 'completed' },
      { stage: 'Requirement Review', date: '2026-09-03 16:45 PM', status: 'completed' },
      { stage: 'Ready for Assignment', date: '2026-09-04 09:00 AM', status: 'completed' },
      { stage: 'Assigned', date: 'Awaiting Allocation', status: 'current' },
      { stage: 'Production', date: 'Pending', status: 'upcoming' },
      { stage: 'QA', date: 'TBD', status: 'upcoming' },
      { stage: 'Final Delivery', date: 'Target: 2026-09-08', status: 'upcoming' }
    ]
  },
  {
    id: 'PRJ-1027',
    bookTitle: 'Principles of Cellular Biochemistry',
    client: 'Oxford Academic',
    format: 'XML',
    projectType: 'XML',
    receivedDate: '2026-09-03',
    dueDate: '2026-09-14',
    priority: 'Medium',
    assignedTo: 'Sarah Chen',
    assignedTeam: 'Accessibility Remediation Unit',
    assignedUserId: 'USR-102',
    startDate: '2026-09-04',
    notes: 'Verify biochemical pathway pathways and high-contrast color scheme.',
    status: 'In Production',
    author: 'Donald Voet & Judith G. Voet',
    publisher: 'Oxford Academic',
    isbn: '978-0-470-57095-1',
    edition: '4th Edition',
    language: 'English (UK)',
    bookType: 'Graduate Academic Monograph',
    requirements: {
      outputFormat: 'JATS XML 1.3 + CrossRef Metadata',
      accessibilityRequired: 'Yes',
      accessibilityStandard: 'WCAG 2.1 Level AA',
      mathFormulaContent: 'Medium (310 chemical structures)',
      imageFigureCount: 220,
      tableCount: 35,
      chapterCount: 20
    },
    sourceFiles: [
      { name: 'Biochemistry_Manuscript.docx', type: 'Word', size: '38.0 MB', uploadDate: '2026-09-03 11:00 AM', downloadUrl: '#' },
      { name: 'Figures_Molecular_HighRes.zip', type: 'Images', size: '145.0 MB', uploadDate: '2026-09-03 11:05 AM', downloadUrl: '#' },
      { name: 'Chemical_Formulas_ChemDraw.cdx', type: 'Reference Files', size: '12.4 MB', uploadDate: '2026-09-03 11:10 AM', downloadUrl: '#' }
    ],
    timeline: [
      { stage: 'Project Received', date: '2026-09-03 11:00 AM', status: 'completed' },
      { stage: 'Requirement Review', date: '2026-09-03 13:00 PM', status: 'completed' },
      { stage: 'Ready for Assignment', date: '2026-09-03 15:30 PM', status: 'completed' },
      { stage: 'Assigned', date: '2026-09-04 08:30 AM', status: 'completed' },
      { stage: 'Production', date: 'Active since 2026-09-04', status: 'current' },
      { stage: 'QA', date: 'Target: 2026-09-11', status: 'upcoming' },
      { stage: 'Final Delivery', date: 'Target: 2026-09-14', status: 'upcoming' }
    ]
  },
  {
    id: 'PRJ-1028',
    bookTitle: 'Early Childhood Literacy & Storytelling',
    client: 'Pearson Education',
    format: 'Print + EPUB',
    projectType: 'Conversion',
    receivedDate: '2026-09-02',
    dueDate: '2026-09-07',
    priority: 'High',
    assignedTo: 'Unassigned',
    assignedTeam: null,
    assignedUserId: null,
    startDate: null,
    notes: '',
    status: 'Under Review',
    author: 'Catherine E. Snow & M. Susan Burns',
    publisher: 'Pearson Education',
    isbn: '978-0-309-06436-1',
    edition: '2nd Illustrated Edition',
    language: 'English (US)',
    bookType: 'Illustrated Educational Guide',
    requirements: {
      outputFormat: 'Fixed-Layout EPUB 3 + Print Hardbound',
      accessibilityRequired: 'Yes',
      accessibilityStandard: 'WCAG 2.1 Level AA (Read-Aloud narration sync)',
      mathFormulaContent: 'None',
      imageFigureCount: 420,
      tableCount: 12,
      chapterCount: 10
    },
    sourceFiles: [
      { name: 'Storytelling_Illustrations_Master.indd', type: 'InDesign', size: '210.5 MB', uploadDate: '2026-09-02 16:20 PM', downloadUrl: '#' },
      { name: 'Audio_Narration_Sync_Tracks.zip', type: 'Reference Files', size: '340.0 MB', uploadDate: '2026-09-02 16:30 PM', downloadUrl: '#' },
      { name: 'Typography_Asset_Bundle.zip', type: 'Reference Files', size: '15.6 MB', uploadDate: '2026-09-02 16:35 PM', downloadUrl: '#' }
    ],
    timeline: [
      { stage: 'Project Received', date: '2026-09-02 16:20 PM', status: 'completed' },
      { stage: 'Requirement Review', date: '2026-09-03 10:00 AM', status: 'current' },
      { stage: 'Ready for Assignment', date: 'Pending Audio QC', status: 'upcoming' },
      { stage: 'Assigned', date: 'Unassigned', status: 'upcoming' },
      { stage: 'Production', date: 'Pending', status: 'upcoming' },
      { stage: 'QA', date: 'TBD', status: 'upcoming' },
      { stage: 'Final Delivery', date: 'Target: 2026-09-07', status: 'upcoming' }
    ]
  },
  {
    id: 'PRJ-1029',
    bookTitle: 'Data Structures and Algorithm Analysis in C++',
    client: 'Springer Nature',
    format: 'EPUB',
    projectType: 'EPUB',
    receivedDate: '2026-09-01',
    dueDate: '2026-09-16',
    priority: 'Medium',
    assignedTo: 'Robert Taylor',
    assignedTeam: 'XML & Pre-Press Division',
    assignedUserId: 'USR-103',
    startDate: '2026-09-03',
    notes: 'Ensure clean syntax highlighting for C++20 code blocks.',
    status: 'In Production',
    author: 'Mark Allen Weiss',
    publisher: 'Springer Nature',
    isbn: '978-0-13-284737-7',
    edition: '5th Edition',
    language: 'English (US)',
    bookType: 'Computer Science Textbook',
    requirements: {
      outputFormat: 'Reflowable EPUB 3.3 + Interactive Code Blocks',
      accessibilityRequired: 'Yes',
      accessibilityStandard: 'WCAG 2.1 Level AA',
      mathFormulaContent: 'Medium (180 Big-O proofs)',
      imageFigureCount: 165,
      tableCount: 28,
      chapterCount: 12
    },
    sourceFiles: [
      { name: 'DataStructures_CPlusPlus_Text.docx', type: 'Word', size: '18.4 MB', uploadDate: '2026-09-01 10:15 AM', downloadUrl: '#' },
      { name: 'Code_Repository_Samples.zip', type: 'Reference Files', size: '8.2 MB', uploadDate: '2026-09-01 10:20 AM', downloadUrl: '#' }
    ],
    timeline: [
      { stage: 'Project Received', date: '2026-09-01 10:15 AM', status: 'completed' },
      { stage: 'Requirement Review', date: '2026-09-01 14:00 PM', status: 'completed' },
      { stage: 'Ready for Assignment', date: '2026-09-02 09:30 AM', status: 'completed' },
      { stage: 'Assigned', date: '2026-09-02 16:00 PM', status: 'completed' },
      { stage: 'Production', date: 'Active since 2026-09-03', status: 'current' },
      { stage: 'QA', date: 'Target: 2026-09-13', status: 'upcoming' },
      { stage: 'Final Delivery', date: 'Target: 2026-09-16', status: 'upcoming' }
    ]
  },
  {
    id: 'PRJ-1030',
    bookTitle: 'International Environmental Law & Treaties',
    client: 'Cambridge University Press',
    format: 'PDF + XML',
    projectType: 'Accessibility',
    receivedDate: '2026-09-04',
    dueDate: '2026-09-09',
    priority: 'High',
    assignedTo: 'Unassigned',
    assignedTeam: null,
    assignedUserId: null,
    startDate: null,
    notes: '',
    status: 'New',
    author: 'Philippe Sands & Jacqueline Peel',
    publisher: 'Cambridge University Press',
    isbn: '978-1-108-43112-5',
    edition: '4th Edition',
    language: 'English (UK)',
    bookType: 'Legal Reference Work',
    requirements: {
      outputFormat: 'Tagged PDF/UA + TEI XML',
      accessibilityRequired: 'Yes',
      accessibilityStandard: 'PDF/UA-1 & WCAG 2.1 AA',
      mathFormulaContent: 'None',
      imageFigureCount: 38,
      tableCount: 94,
      chapterCount: 18
    },
    sourceFiles: [
      { name: 'Environmental_Law_Complete.docx', type: 'Word', size: '29.1 MB', uploadDate: '2026-09-04 11:45 AM', downloadUrl: '#' },
      { name: 'Treaties_Corpus_Appendix.pdf', type: 'PDF', size: '14.8 MB', uploadDate: '2026-09-04 11:50 AM', downloadUrl: '#' }
    ],
    timeline: [
      { stage: 'Project Received', date: '2026-09-04 11:45 AM', status: 'completed' },
      { stage: 'Requirement Review', date: 'In progress', status: 'current' },
      { stage: 'Ready for Assignment', date: 'Pending', status: 'upcoming' },
      { stage: 'Assigned', date: 'Unassigned', status: 'upcoming' },
      { stage: 'Production', date: 'TBD', status: 'upcoming' },
      { stage: 'QA', date: 'TBD', status: 'upcoming' },
      { stage: 'Final Delivery', date: 'Target: 2026-09-09', status: 'upcoming' }
    ]
  },
  {
    id: 'PRJ-1031',
    bookTitle: 'Clinical Pharmacology & Therapeutics',
    client: 'Elsevier Health',
    format: 'XML + EPUB',
    projectType: 'Conversion',
    receivedDate: '2026-09-03',
    dueDate: '2026-09-18',
    priority: 'Low',
    assignedTo: 'Priya Patel',
    assignedTeam: 'STEM Math Typesetting Squad',
    assignedUserId: 'USR-104',
    startDate: '2026-09-04',
    notes: 'Dosage table validation with double-blind QA.',
    status: 'In Production',
    author: 'Lionel D. Lewis & James M. Ritter',
    publisher: 'Elsevier Health',
    isbn: '978-0-7020-7495-0',
    edition: '10th Edition',
    language: 'English (UK)',
    bookType: 'Medical Reference',
    requirements: {
      outputFormat: 'JATS XML + Reflowable EPUB',
      accessibilityRequired: 'Yes',
      accessibilityStandard: 'WCAG 2.1 AA',
      mathFormulaContent: 'Low (45 dosage formulas)',
      imageFigureCount: 88,
      tableCount: 110,
      chapterCount: 42
    },
    sourceFiles: [
      { name: 'Pharmacology_Raw_Package.zip', type: 'Word', size: '52.3 MB', uploadDate: '2026-09-03 15:30 PM', downloadUrl: '#' },
      { name: 'Drug_Interactions_Table_Master.xlsx', type: 'Reference Files', size: '6.4 MB', uploadDate: '2026-09-03 15:35 PM', downloadUrl: '#' }
    ],
    timeline: [
      { stage: 'Project Received', date: '2026-09-03 15:30 PM', status: 'completed' },
      { stage: 'Requirement Review', date: '2026-09-03 17:00 PM', status: 'completed' },
      { stage: 'Ready for Assignment', date: '2026-09-04 09:30 AM', status: 'completed' },
      { stage: 'Assigned', date: '2026-09-04 10:15 AM', status: 'completed' },
      { stage: 'Production', date: 'Active', status: 'current' },
      { stage: 'QA', date: 'Target: 2026-09-15', status: 'upcoming' },
      { stage: 'Final Delivery', date: 'Target: 2026-09-18', status: 'upcoming' }
    ]
  }
];

export const RECENT_ACTIVITIES = [
  {
    id: 'ACT-501',
    timestamp: '10 minutes ago',
    activity: 'EPUB conversion completed',
    project: 'PRJ-1011 (Advanced Organic Chemistry)',
    status: 'Completed',
    icon: 'CheckCircle2',
    color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    user: 'Pradhap Kumar'
  },
  {
    id: 'ACT-502',
    timestamp: '42 minutes ago',
    activity: 'Accessibility QA started',
    project: 'PRJ-1012 (Global Economics & Trade Policy)',
    status: 'In Progress',
    icon: 'Eye',
    color: 'text-blue-600 bg-blue-50 border-blue-200',
    user: 'Sarah Chen'
  },
  {
    id: 'ACT-503',
    timestamp: '2 hours ago',
    activity: 'Files uploaded (Manuscript & HighRes Figures)',
    project: 'PRJ-1024 (Biology Fundamentals)',
    status: 'Intake',
    icon: 'UploadCloud',
    color: 'text-purple-600 bg-purple-50 border-purple-200',
    user: 'ABC Publishing Portal'
  },
  {
    id: 'ACT-504',
    timestamp: '4 hours ago',
    activity: 'Review comments received from Publisher Editor',
    project: 'PRJ-1008 (Clinical Neurology)',
    status: 'Review',
    icon: 'MessageSquare',
    color: 'text-amber-600 bg-amber-50 border-amber-200',
    user: 'Dr. Aris Thorne (Author)'
  },
  {
    id: 'ACT-505',
    timestamp: 'Yesterday at 05:40 PM',
    activity: 'Project moved to final review stage',
    project: 'PRJ-1009 (Microbiology Fundamentals)',
    status: 'Final Review',
    icon: 'ArrowRightCircle',
    color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    user: 'Markus Weber'
  },
  {
    id: 'ACT-506',
    timestamp: 'Yesterday at 02:15 PM',
    activity: 'MathML structural tagging passed automated schema test',
    project: 'PRJ-1011 (Advanced Organic Chemistry)',
    status: 'QA Passed',
    icon: 'CheckCheck',
    color: 'text-teal-600 bg-teal-50 border-teal-200',
    user: 'Automated Validator'
  }
];
