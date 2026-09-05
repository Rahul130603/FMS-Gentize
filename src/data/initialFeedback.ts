import { InternalFeedbackItem } from '../types/feedback';

export const INITIAL_FEEDBACK: InternalFeedbackItem[] = [
  {
    id: 'FDB-00084',
    type: 'Improvement',
    title: 'Improve EPUB accessibility warnings and highlight contrast preview',
    description: 'Provide an inline visual simulator in the Accessibility Checker that dynamically highlights low-contrast text elements and missing alt tags directly in the rendered page preview instead of only showing raw line numbers.',
    category: 'Accessibility',
    relatedModule: 'Accessibility Checker',
    relatedBook: 'EPUB Accessibility Handbook',
    problemCurrentExperience: 'Currently, accessibility reviewers must manually open the XHTML source file and search for the reported line numbers. For large files with 200+ illustrations, this adds 30-45 minutes per chapter.',
    suggestedImprovement: 'Add an overlay toggle to the preview pane that outlines failing DOM nodes in red/orange with a popover showing WCAG 2.1 failure details and quick-fix suggestions.',
    expectedBenefit: 'Reduces manual inspection time by approximately 65% and enables editorial staff to correct contrast issues without inspecting raw HTML.',
    whoIsAffected: 'Accessibility Reviewers, Quality Assurance Leads, and Production Editors.',
    frequency: 'Every EPUB release (multiple times daily)',
    productionImpact: 'High',
    priority: 'High',
    suggestedSolution: 'Integrate axe-core DOM overlay highlighter inside the iframe preview component of PubVantage Studio. When an error is clicked in the left drawer, trigger smooth scroll and flash outline the offending element.',
    attachments: [
      {
        id: 'f-att-1',
        name: 'contrast_highlighter_mockup.png',
        type: 'image/png',
        size: '1.2 MB',
        source: 'sample',
        url: '/sample-evidence/sample-screenshot.png',
        uploadedAt: '2026-09-04 11:00'
      },
      {
        id: 'f-att-2',
        name: 'accessibility_qa_benchmark.pdf',
        type: 'application/pdf',
        size: '340 KB',
        source: 'sample',
        url: '/sample-evidence/sample-evidence.pdf',
        uploadedAt: '2026-09-04 11:05'
      }
    ],
    submittedBy: 'Arun K.',
    submittedDate: '2026-09-04',
    team: 'Production Team',
    assignedTo: 'Priya S.',
    owner: 'Priya S.',
    status: 'Under Review',
    targetDate: '2026-10-15',
    reviewer: 'Priya S.',
    reviewNotes: 'Excellent proposal. We can leverage the axe-core iframe bridge we built for automated audits. Scheduling for Sprint 28 planning review.',
    decision: 'Approved for Roadmap',
    decisionDate: '2026-09-04',
    timeline: [
      {
        id: 'ftl-1',
        timestamp: '2026-09-04 11:00',
        title: 'Feedback submitted by Arun K.',
        user: 'Arun K.',
        role: 'Senior EPUB Developer',
        details: 'Submitted improvement idea for Accessibility Checker.',
        type: 'submit'
      },
      {
        id: 'ftl-2',
        timestamp: '2026-09-04 15:30',
        title: 'Moved to Under Review by Priya S.',
        user: 'Priya S.',
        role: 'Lead Accessibility Engineer',
        details: 'Assigned to accessibility tooling evaluation.',
        type: 'review'
      }
    ],
    comments: [
      {
        id: 'fc-1',
        author: 'Priya S.',
        role: 'Lead Accessibility Engineer',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        createdAt: '2026-09-04 16:00',
        content: 'This would reduce the number of manual accessibility checks during EPUB QA significantly. We can test this in the Chapter 4 test suite first.'
      },
      {
        id: 'fc-2',
        author: 'Rahul M.',
        role: 'Quality Assurance Lead',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
        createdAt: '2026-09-04 16:45',
        content: 'Fully support this. Our team spends hours pinpointing nested footnote contrast warnings.'
      }
    ]
  },
  {
    id: 'FDB-00083',
    type: 'Feature Request',
    title: 'Add bulk chapter validation and parallel EpubCheck batch runs',
    description: 'Allow production specialists to select multiple chapters or entire book series and run EPUB validation, Ace accessibility, and link checks in parallel with a single click.',
    category: 'Automation',
    relatedModule: 'Chapter Manager',
    relatedBook: 'Digital Publishing Guide',
    problemCurrentExperience: 'Currently, users must open each chapter individually, click "Run Validation", wait 15 seconds, and then repeat for all 24 chapters. For an omnibus edition, this takes over an hour.',
    suggestedImprovement: 'Provide a "Batch Validate Selected Chapters" action in the Chapter Manager table header with a live progress bar and aggregate error summary.',
    expectedBenefit: 'Saves 40+ hours per month across the 12-person production department and catches cross-chapter ID breakages earlier.',
    whoIsAffected: 'All EPUB production engineers, batch conversion operators, and QA team members.',
    frequency: 'Daily during QA and pre-flight publication phases',
    productionImpact: 'High',
    priority: 'High',
    suggestedSolution: 'Implement a Web Worker pool running EpubCheck WASM threads, aggregating JSON reports into a master dashboard with filterable results.',
    attachments: [
      {
        id: 'f-att-3',
        name: 'batch_validation_ui_flow.pdf',
        type: 'application/pdf',
        size: '512 KB',
        source: 'sample',
        url: '/sample-evidence/sample-evidence.pdf',
        uploadedAt: '2026-09-03 14:00'
      }
    ],
    submittedBy: 'Rahul M.',
    submittedDate: '2026-09-03',
    team: 'QA Team',
    assignedTo: 'Product Team',
    owner: 'Product Team',
    status: 'Planned',
    targetDate: '2026-11-01',
    reviewer: 'Devon Miller',
    reviewNotes: 'Prioritized for Q4 roadmap. Product team will spec the worker concurrency architecture.',
    decision: 'Approved for Roadmap',
    decisionDate: '2026-09-04',
    timeline: [
      {
        id: 'ftl-3',
        timestamp: '2026-09-03 14:00',
        title: 'Submitted by Rahul M.',
        user: 'Rahul M.',
        role: 'QA Lead',
        type: 'submit'
      },
      {
        id: 'ftl-4',
        timestamp: '2026-09-04 09:30',
        title: 'Reviewed and Planned by Product Team',
        user: 'Devon Miller',
        role: 'Managing Editor',
        type: 'plan'
      }
    ],
    comments: [
      {
        id: 'fc-3',
        author: 'Arun K.',
        role: 'Senior EPUB Developer',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
        createdAt: '2026-09-03 15:20',
        content: 'We can queue the background worker jobs and stream results using Server-Sent Events or local Web Workers.'
      }
    ]
  },
  {
    id: 'FDB-00082',
    type: 'Usability Feedback',
    title: 'Make TOC errors and playOrder discrepancies easier to understand',
    description: 'Transform raw EpubCheck error logs (e.g. "RSC-005 playOrder out of sequence") into friendly visual breadcrumbs showing exactly where the TOC tree is disconnected.',
    category: 'EPUB Production',
    relatedModule: 'TOC Manager',
    relatedBook: 'Understanding Typography',
    problemCurrentExperience: 'Cryptic error strings like "RSC-005: playOrder value 28 does not match index 25" are confusing to junior editors and require escalation to senior engineers.',
    suggestedImprovement: 'Display an interactive visual tree diagram of the TOC where mismatched nodes are highlighted with an auto-repair button ("Re-sequence TOC").',
    expectedBenefit: 'Empowers non-technical editors to resolve 80% of TOC navigation errors autonomously without filing engineering tickets.',
    whoIsAffected: 'Junior Typesetters, Content Editors, and Production Specialists.',
    frequency: 'Weekly across standard textbook production cycles',
    productionImpact: 'Medium',
    priority: 'Medium',
    suggestedSolution: 'Build a tree visualization inside the TOC Manager with drag-and-drop hierarchy reordering and a 1-click "Fix playOrder Sequence" action.',
    attachments: [],
    submittedBy: 'Meena R.',
    submittedDate: '2026-09-02',
    team: 'Production Team',
    assignedTo: 'Production Team',
    owner: 'Production Team',
    status: 'In Progress',
    targetDate: '2026-09-25',
    reviewer: 'Arun K.',
    reviewNotes: 'Currently prototyping the drag-and-drop TOC tree component. Expected beta release next week.',
    decision: 'Approved for Roadmap',
    decisionDate: '2026-09-02',
    timeline: [
      {
        id: 'ftl-5',
        timestamp: '2026-09-02 10:15',
        title: 'Submitted by Meena R.',
        user: 'Meena R.',
        type: 'submit'
      },
      {
        id: 'ftl-6',
        timestamp: '2026-09-03 11:00',
        title: 'Development started',
        user: 'Arun K.',
        type: 'progress'
      }
    ],
    comments: [
      {
        id: 'fc-4',
        author: 'Meena R.',
        role: 'Production Specialist',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
        createdAt: '2026-09-02 10:20',
        content: 'Our editorial interns encountered this 4 times this week on the Typography textbook. A visual tree will be a huge time-saver!'
      }
    ]
  },
  {
    id: 'FDB-00081',
    type: 'Suggestion',
    title: 'Auto-generate MathML spoken text annotations via AI voice model',
    description: 'Provide an option to automatically synthesize and verify spoken English transcriptions for complex math equations and chemistry formulas during EPUB export.',
    category: 'Accessibility',
    relatedModule: 'Accessibility Checker',
    relatedBook: 'Accessible EPUB Production',
    problemCurrentExperience: 'Manually writing Nemeth Braille and spoken text descriptions for 300+ math formulas per textbook takes up to 4 business days.',
    suggestedImprovement: 'Add an "AI Math-to-Speech Annotation" wizard that suggests standard spoken representations for LaTeX/MathML formulas with human sign-off.',
    expectedBenefit: 'Reduces math accessibility authoring time by over 70% while ensuring full DAISY/EPUB 3.2 compliance.',
    whoIsAffected: 'Accessibility Specialists and STEM Book Authors.',
    frequency: 'Frequent on STEM textbook titles',
    productionImpact: 'High',
    priority: 'High',
    suggestedSolution: 'Integrate MathCAT or Speech Rule Engine to produce SSML and spoken text strings automatically.',
    attachments: [],
    submittedBy: 'Priya S.',
    submittedDate: '2026-08-29',
    team: 'Accessibility Team',
    assignedTo: 'Priya S.',
    owner: 'Priya S.',
    status: 'Implemented',
    targetDate: '2026-09-01',
    reviewer: 'Devon Miller',
    reviewNotes: 'Implemented in v2.4 release via Speech Rule Engine integration.',
    decision: 'Approved for Roadmap',
    decisionDate: '2026-08-30',
    timeline: [
      {
        id: 'ftl-7',
        timestamp: '2026-08-29 09:00',
        title: 'Submitted by Priya S.',
        user: 'Priya S.',
        type: 'submit'
      },
      {
        id: 'ftl-8',
        timestamp: '2026-09-01 17:00',
        title: 'Implemented and Deployed',
        user: 'Arun K.',
        type: 'implemented'
      }
    ],
    comments: [
      {
        id: 'fc-5',
        author: 'Elena Vance',
        role: 'Senior Typesetter',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80',
        createdAt: '2026-09-02 09:15',
        content: 'Tested this on Chapter 3 formulas and it generated accurate verbalizations for all derivatives!'
      }
    ]
  },
  {
    id: 'FDB-00080',
    type: 'Process Issue',
    title: 'Standardize font licensing metadata embedding in OPF spine manifest',
    description: 'Ensure all proprietary embedded web fonts have standardized font obfuscation algorithms and Adobe/IDPF font mangling keys recorded in the manifest.',
    category: 'Process Improvement',
    relatedModule: 'EPUB Compiler',
    relatedBook: 'Publishing Standards Guide',
    problemCurrentExperience: 'Different typesetters use inconsistent encryption.xml structures, causing validation warnings during distributor ingestion.',
    suggestedImprovement: 'Enforce automatic standard Adobe font encryption schema during EPUB packaging when licensed fonts are detected.',
    expectedBenefit: 'Eliminates 100% of font license rejection notices from Ingram and Amazon KDP.',
    whoIsAffected: 'Typesetters and Distribution Specialists.',
    frequency: 'On all custom typeface titles',
    productionImpact: 'Medium',
    priority: 'Medium',
    suggestedSolution: 'Add font license validator check to pre-flight compiler.',
    attachments: [],
    submittedBy: 'Devon Miller',
    submittedDate: '2026-08-25',
    team: 'Editorial Team',
    assignedTo: 'Arun K.',
    owner: 'Arun K.',
    status: 'New',
    targetDate: '2026-10-01',
    timeline: [
      {
        id: 'ftl-9',
        timestamp: '2026-08-25 14:20',
        title: 'Submitted by Devon Miller',
        user: 'Devon Miller',
        type: 'submit'
      }
    ],
    comments: []
  }
];
