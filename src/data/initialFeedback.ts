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
    rootCause: 'Accessibility contrast and missing alt tag checks are executed post-conversion by inspecting raw line numbers rather than rendering elements in an interactive DOM overlay.',
    preventiveAction: 'Incorporate an automated WCAG 2.1 pre-check bridge in the authoring environment that warns editors of color contrast violations before file sign-off.',
    correctiveAction: 'Integrate an axe-core DOM overlay highlighter into the preview pane to outline failing nodes and apply immediate color contrast adjustments.',
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
    submittedBy: 'Priya S.',
    submittedDate: '2026-09-04',
    team: 'Accessibility Team',
    assignedTo: 'Arun K.',
    owner: 'Arun K.',
    status: 'Under Review',
    targetDate: '2026-10-15',
    reviewer: 'Arun K.',
    reviewNotes: 'Excellent proposal. We can leverage the axe-core iframe bridge we built for automated audits. Scheduling for Sprint 28 planning review.',
    decision: 'Approved for Roadmap',
    decisionDate: '2026-09-04',
    timeline: [
      {
        id: 'ftl-1',
        timestamp: '2026-09-04 11:00',
        title: 'Feedback submitted by Priya S.',
        user: 'Priya S.',
        role: 'Lead Accessibility Engineer',
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
    category: 'EPDF',
    relatedModule: 'Chapter Manager',
    relatedBook: 'Digital Publishing Guide',
    rootCause: 'Chapter validation runs sequentially in a single UI thread, forcing operators to execute manual checks chapter-by-chapter across multi-volume book editions.',
    preventiveAction: 'Establish an asynchronous batch validation architecture with Web Worker concurrency for all multi-chapter omnibus ingestions.',
    correctiveAction: 'Deploy a Web Worker pool running EpubCheck WASM threads to validate all selected chapters in parallel and stream consolidated reports.',
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
    assignedTo: 'Saran S.',
    owner: 'Saran S.',
    status: 'Planned',
    targetDate: '2026-11-01',
    reviewer: 'Saran S.',
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
        title: 'Reviewed and Planned by Saran S.',
        user: 'Saran S.',
        role: 'Publishing Operations Lead',
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
    type: 'Improvement',
    title: 'Make TOC errors and playOrder discrepancies easier to understand',
    description: 'Transform raw EpubCheck error logs (e.g. "RSC-005 playOrder out of sequence") into friendly visual breadcrumbs showing exactly where the TOC tree is disconnected.',
    category: 'Scanning',
    relatedModule: 'TOC Manager',
    relatedBook: 'Understanding Typography',
    rootCause: 'TOC playOrder discrepancies occur when OCR scanning splits nested chapter sub-headings into unlinked flat nodes without hierarchy sequencing.',
    preventiveAction: 'Introduce automated TOC structural linting during OCR scan ingestion to prevent broken playOrder indexes prior to XHTML compilation.',
    correctiveAction: 'Implement an interactive drag-and-drop TOC tree visualizer with a 1-click automatic playOrder re-sequencing action.',
    expectedBenefit: 'Empowers non-technical editors to resolve 80% of TOC navigation errors autonomously without filing engineering tickets.',
    whoIsAffected: 'Junior Typesetters, Content Editors, and Production Specialists.',
    frequency: 'Weekly across standard textbook production cycles',
    productionImpact: 'Medium',
    priority: 'Medium',
    suggestedSolution: 'Build a tree visualization inside the TOC Manager with drag-and-drop hierarchy reordering and a 1-click "Fix playOrder Sequence" action.',
    attachments: [],
    submittedBy: 'Meena T.',
    submittedDate: '2026-09-02',
    team: 'Editorial Team',
    assignedTo: 'Priya S.',
    owner: 'Priya S.',
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
        title: 'Submitted by Meena T.',
        user: 'Meena T.',
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
        author: 'Meena T.',
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
    rootCause: 'STEM textbook formulas lack automated speech transcriptions, requiring accessibility specialists to manually compose Nemeth Braille and spoken text strings for hundreds of equations.',
    preventiveAction: 'Enforce standard MathML with embedded speech markup templates during typesetting ingestion to prevent untranscribed math formulas.',
    correctiveAction: 'Integrate MathCAT and Speech Rule Engine to synthesize SSML spoken descriptions automatically for all LaTeX/MathML equations.',
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
    assignedTo: 'Arun K.',
    owner: 'Arun K.',
    status: 'Implemented',
    targetDate: '2026-09-01',
    reviewer: 'Arun K.',
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
    category: 'POD',
    relatedModule: 'EPUB Compiler',
    relatedBook: 'Publishing Standards Guide',
    rootCause: 'Typesetters apply divergent font encryption schemas manually, resulting in inconsistent encryption.xml manifests and distributor ingestion rejections.',
    preventiveAction: 'Standardize font obfuscation policies in the project settings profile so all licensed web fonts inherit the certified Adobe font algorithm.',
    correctiveAction: 'Enforce automatic standard Adobe font encryption and manifest validation in the EPUB compiler pre-flight packaging pipeline.',
    expectedBenefit: 'Eliminates 100% of font license rejection notices from Ingram and Amazon KDP.',
    whoIsAffected: 'Typesetters and Distribution Specialists.',
    frequency: 'On all custom typeface titles',
    productionImpact: 'Medium',
    priority: 'Medium',
    suggestedSolution: 'Add font license validator check to pre-flight compiler.',
    attachments: [],
    submittedBy: 'Saran S.',
    submittedDate: '2026-08-25',
    team: 'Publishing Team',
    assignedTo: 'Arun K.',
    owner: 'Arun K.',
    status: 'New',
    targetDate: '2026-10-01',
    timeline: [
      {
        id: 'ftl-9',
        timestamp: '2026-08-25 14:20',
        title: 'Submitted by Saran S.',
        user: 'Saran S.',
        type: 'submit'
      }
    ],
    comments: []
  }
];
