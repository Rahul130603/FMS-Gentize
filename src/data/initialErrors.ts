import { ErrorReport } from '../types/errors';

export const INITIAL_ERRORS: ErrorReport[] = [
  {
    id: 'ERR-00125',
    projectType: 'Scan',
    chapter: 'Chapter 04: Mindfulness in Space',
    serverLocation: '/server/scan/batch-1400/ch04.xhtml',
    isbnNumber: '978-0-14-312774-1',
    description: 'OCR baseline drift and character recognition distortion on 600 DPI scan plates causes corrupted ligature encoding (fi, fl, ffi) during automated text transcription.',
    expectedResult: 'Scan OCR pipeline must generate valid UTF-8 character maps with normalized ligature glyphs matching the source print manuscript.',
    actualResult: 'Distorted ligature glyphs render as replacement diamond question marks in downstream XHTML reflow.',
    reportedBy: 'QA Team',
    source: 'QA',
    assignedTo: 'Priya S.',
    team: 'Accessibility Team',
    priority: 'High',
    dueDate: '2026-09-08',
    status: 'Open',
    attachments: [
      {
        id: 'att-101',
        name: 'Screenshot 2026-07-09 151304.png',
        type: 'image/png',
        size: '62 KB',
        source: 'sample',
        url: '/sample-evidence/sample-screenshot.png',
        uploadedAt: '2026-07-09 15:13'
      },
      {
        id: 'att-102',
        name: '9780820426990_cvr_int.pdf',
        type: 'application/pdf',
        size: '5.3 MB',
        source: 'sample',
        url: '/sample-evidence/sample-evidence.pdf',
        uploadedAt: '2026-09-04 09:20'
      },
      {
        id: 'att-103',
        name: 'scan_ocr_ch04_distortion_report.log',
        type: 'text/plain',
        size: '142 KB',
        source: 'sample',
        url: '/sample-evidence/sample-production.log',
        uploadedAt: '2026-09-04 09:18'
      }
    ],
    timeline: [
      {
        id: 'tl-1',
        timestamp: '2026-09-04 09:15',
        title: 'Issue reported by QA Team',
        user: 'Rahul M.',
        role: 'QA Team',
        details: 'Discovered during OCR batch conversion pass for 600 DPI archive scan.',
        type: 'report'
      },
      {
        id: 'tl-2',
        timestamp: '2026-09-04 10:20',
        title: 'Assigned to Priya S.',
        user: 'Rahul M.',
        role: 'QA Lead',
        details: 'Assigned to Priya S. with High priority for upcoming publication master delivery.',
        type: 'assignment'
      }
    ],
    comments: [
      {
        id: 'c-1',
        author: 'Rahul M.',
        role: 'Quality Assurance Lead',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
        createdAt: '2026-09-04 09:30',
        content: 'Elena provided the re-scanned high-density plates in the raw archive. Priya, please re-run ligature normalization script.'
      }
    ]
  },
  {
    id: 'ERR-00124',
    projectType: 'Accessibility',
    chapter: 'Chapter 01: Foundations of Accessible Publishing',
    serverLocation: '/server/accessibility/screen-reader/ch01-nav.xhtml',
    isbnNumber: '978-1-4919-8472-7',
    description: 'Hero infographic on interior spatial awareness is missing an alt attribute and aria-describedby reference, violating EPUB Accessibility 1.1 and WCAG 2.1 Level AA requirements.',
    expectedResult: 'Every informative image inside reflowable XHTML documents must have meaningful alt text or aria-labelledby pointing to descriptive figure caption.',
    actualResult: '<img src="images/fig_01_02.png" /> without alt attribute causes Ace Accessibility Validator to throw critical WCAG 1.1.1 failure.',
    reportedBy: 'Accessibility',
    source: 'Accessibility Review',
    assignedTo: 'Priya S.',
    team: 'Accessibility Team',
    priority: 'High',
    dueDate: '2026-09-06',
    status: 'Open',
    attachments: [
      {
        id: 'att-104',
        name: 'ace_report_ch01_accessibility.json',
        type: 'application/json',
        size: '142 KB',
        source: 'sample',
        url: '/sample-evidence/sample-accessibility-report.json',
        uploadedAt: '2026-09-04 09:18'
      },
      {
        id: 'att-105',
        name: 'fig_01_02_screenshot.png',
        type: 'image/png',
        size: '1.8 MB',
        source: 'sample',
        url: '/sample-evidence/sample-screenshot.png',
        uploadedAt: '2026-09-04 09:20'
      }
    ],
    timeline: [
      {
        id: 'tl-3',
        timestamp: '2026-09-04 09:15',
        title: 'Error reported by Accessibility Team',
        user: 'Rahul M.',
        role: 'QA Team',
        details: 'Discovered during automated EPUB 3.2 Accessibility audit pass.',
        type: 'report'
      }
    ],
    comments: [
      {
        id: 'c-2',
        author: 'Elena Vance',
        role: 'Senior Typesetter',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80',
        createdAt: '2026-09-04 11:10',
        content: 'Editorial team supplied descriptive text for Figure 1.2. Updating XHTML alt tags now.'
      }
    ]
  },
  {
    id: 'ERR-00123',
    projectType: 'POD',
    chapter: 'Chapter 08: Interactive EPUB Media',
    serverLocation: '/server/pod/press-ready/ch08-spread.pdf',
    isbnNumber: '978-1-59327-928-8',
    description: 'Print on Demand trim box margin violations and missing 3mm bleed allowance on full-bleed spreads for digital offset press run.',
    expectedResult: 'PDF/X-1a press packages must include minimum 0.125 in (3mm) bleed beyond the trim line on outer bounding box.',
    actualResult: 'Outer gutter margins crop inside 4mm live text area on 2-up signature proof during pre-flight checks.',
    reportedBy: 'Production',
    source: 'Production',
    assignedTo: 'Arun K.',
    team: 'Production Team',
    priority: 'High',
    dueDate: '2026-09-07',
    status: 'In Progress',
    attachments: [
      {
        id: 'att-106',
        name: 'pod_preflight_ch08_margins.log',
        type: 'text/plain',
        size: '28 KB',
        source: 'sample',
        url: '/sample-evidence/sample-production.log',
        uploadedAt: '2026-09-04 10:45'
      },
      {
        id: 'att-107',
        name: 'pod_spread_ch08_bleed_proof.pdf',
        type: 'application/pdf',
        size: '3.2 MB',
        source: 'sample',
        url: '/sample-evidence/sample-evidence.pdf',
        uploadedAt: '2026-09-04 11:00'
      }
    ],
    timeline: [
      {
        id: 'tl-4',
        timestamp: '2026-09-04 10:40',
        title: 'Reported by Production',
        user: 'Meena R.',
        role: 'Production Specialist',
        details: 'Pre-flight check detected margin box truncation.',
        type: 'report'
      },
      {
        id: 'tl-5',
        timestamp: '2026-09-04 14:35',
        title: 'Fix started by Arun K.',
        user: 'Arun K.',
        role: 'Senior EPUB Developer',
        details: 'Adjusting InDesign trim box coordinates and re-exporting press-ready PDF.',
        type: 'status_change'
      }
    ],
    comments: [
      {
        id: 'c-3',
        author: 'Arun K.',
        role: 'Senior EPUB Developer',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
        createdAt: '2026-09-04 14:40',
        content: 'Adjusted bleed bounding box in export profile. Re-generating PDF proof.'
      }
    ]
  },
  {
    id: 'ERR-00122',
    projectType: 'EPDF',
    chapter: 'Chapter 02: Serif Anatomy',
    serverLocation: '/server/epdf/tag-trees/sec02-tables.pdf',
    isbnNumber: '978-0-262-53658-5',
    description: 'PDF/UA tag tree collapse in multi-column tables causes incorrect reading order when processed by assistive technologies.',
    expectedResult: 'Document structure tags must preserve logical reading order (<Table> -> <TR> -> <TH> / <TD>) without orphan content blocks.',
    actualResult: 'Table cell text streams are tagged out of sequence, reading across rows rather than following column flow.',
    reportedBy: 'Accessibility',
    source: 'Accessibility Review',
    assignedTo: 'Rahul M.',
    team: 'Accessibility Team',
    priority: 'High',
    dueDate: '2026-09-05',
    status: 'Resolved',
    attachments: [
      {
        id: 'att-108',
        name: 'typography_ch02_headings_diff.patch',
        type: 'text/x-diff',
        size: '4.2 KB',
        source: 'sample',
        url: '/sample-evidence/sample-diff.patch',
        uploadedAt: '2026-09-03 16:30'
      }
    ],
    resolutionNotes: 'Re-tagged PDF table tree using Adobe Acrobat Pro Accessibility Wizard and verified sequential reading order in PAC 2024.',
    fixedBy: 'Elena Vance',
    fixedDate: '2026-09-04',
    timeline: [
      {
        id: 'tl-6',
        timestamp: '2026-09-03 11:20',
        title: 'Error reported by Accessibility Team',
        user: 'Priya S.',
        role: 'Accessibility Lead',
        type: 'report'
      },
      {
        id: 'tl-7',
        timestamp: '2026-09-04 16:15',
        title: 'Marked as resolved',
        user: 'Elena Vance',
        role: 'Senior Typesetter',
        details: 'Tag tree restructured and verified.',
        type: 'resolution'
      }
    ],
    comments: [
      {
        id: 'c-4',
        author: 'Elena Vance',
        role: 'Senior Typesetter',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80',
        createdAt: '2026-09-04 16:20',
        content: 'Fixed and verified in PAC 2024 and JAWS reader. Ready for QA sign-off.'
      }
    ]
  },
  {
    id: 'ERR-00121',
    projectType: 'Accessibility',
    chapter: 'Chapter 03: MathML & MathJax Fallbacks',
    serverLocation: '/server/accessibility/math-speech/ch03.xhtml',
    isbnNumber: '978-0-13-468599-1',
    description: 'MathML math formulas missing spoken speech fallback alt annotations, causing screen readers to pronounce raw LaTeX syntax.',
    expectedResult: 'MathML <math> blocks must include spoken English speech text annotations and SVG fallbacks for universal device support.',
    actualResult: 'Voice synthesizer reads "\\frac{d}{dx}" verbatim instead of "derivative with respect to x".',
    reportedBy: 'Priya S.',
    source: 'Accessibility Review',
    assignedTo: 'Priya S.',
    team: 'Accessibility Team',
    priority: 'High',
    dueDate: '2026-09-03',
    status: 'Reopened',
    attachments: [
      {
        id: 'att-109',
        name: 'mathml_speech_annotation_template.xml',
        type: 'application/xml',
        size: '8.1 KB',
        source: 'sample',
        url: '/sample-evidence/sample-math-annotation.xml',
        uploadedAt: '2026-09-02 14:00'
      }
    ],
    resolutionNotes: 'Initial fix provided PNG fallback, but alt text contained raw LaTeX symbols that screen readers could not pronounce cleanly.',
    timeline: [
      {
        id: 'tl-8',
        timestamp: '2026-08-30 14:00',
        title: 'Reported by Priya S.',
        user: 'Priya S.',
        type: 'report'
      },
      {
        id: 'tl-9',
        timestamp: '2026-09-02 16:30',
        title: 'Reopened by QA',
        user: 'Rahul M.',
        details: 'Screen reader voice synthesizer failed on un-sanitized LaTeX syntax. Reopened for Nemeth math speech annotation.',
        type: 'reopen'
      }
    ],
    comments: [
      {
        id: 'c-5',
        author: 'Rahul M.',
        role: 'QA Lead',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
        createdAt: '2026-09-02 16:35',
        content: 'NVDA reads "\\frac{d}{dx}" verbatim. Need spoken English Nemeth speech annotation on the <annotation> tag.'
      }
    ]
  },
  {
    id: 'ERR-00120',
    projectType: 'EPDF',
    chapter: 'Chapter 06: Continuous Delivery Pipelines',
    serverLocation: '/server/epdf/interactive/ch06-forms.pdf',
    isbnNumber: '978-0-321-94856-4',
    description: 'Interactive form field tab order is misaligned with visual form field sequence in interactive workbook PDF.',
    expectedResult: 'Tab key navigation must move sequentially from left-to-right, top-to-bottom across all interactive text fields.',
    actualResult: 'Tab key jumps from Field 1 directly to Field 7, skipping intermediate inputs.',
    reportedBy: 'QA Team',
    source: 'QA',
    assignedTo: 'Arun K.',
    team: 'Production Team',
    priority: 'Medium',
    dueDate: '2026-09-04',
    status: 'Closed',
    attachments: [],
    resolutionNotes: 'Re-indexed PDF form AcroForm TabOrder dictionary sequentially in PDF master template.',
    fixedBy: 'Arun K.',
    fixedDate: '2026-09-02',
    verificationNotes: 'Tested across Adobe Acrobat Reader, Apple Preview, and Chrome PDF viewer. Verified tab order is strictly sequential.',
    verifiedBy: 'Rahul M.',
    verifiedDate: '2026-09-02',
    timeline: [
      {
        id: 'tl-10',
        timestamp: '2026-09-01 09:00',
        title: 'Reported by QA Team',
        user: 'Rahul M.',
        type: 'report'
      },
      {
        id: 'tl-11',
        timestamp: '2026-09-02 11:30',
        title: 'Resolved by Arun K.',
        user: 'Arun K.',
        type: 'resolution'
      },
      {
        id: 'tl-12',
        timestamp: '2026-09-02 15:00',
        title: 'Verified and Closed',
        user: 'Rahul M.',
        type: 'verification'
      }
    ],
    comments: []
  },
  {
    id: 'ERR-00119',
    projectType: 'POD',
    chapter: 'Chapter 05: Color Profiles & Press Specs',
    serverLocation: '/server/pod/cmyk-profiles/ch05-figures.pdf',
    isbnNumber: '978-0-06-231609-7',
    description: 'Total Area Coverage (TAC) exceeding 300% maximum ink limit on high-density color photographs in POD press master file.',
    expectedResult: 'All raster images converted to GRACoL 2006 Coated 1v2 profile with maximum total ink limit under 300% TAC.',
    actualResult: 'Shadow regions in Figure 5.4 reach 334% TAC, causing potential ink smearing during high-speed inkjet web printing.',
    reportedBy: 'Production',
    source: 'Production',
    assignedTo: 'Meena R.',
    team: 'Production Team',
    priority: 'Medium',
    dueDate: '2026-09-08',
    status: 'Open',
    attachments: [
      {
        id: 'att-110',
        name: 'ink_density_tac_report.pdf',
        type: 'application/pdf',
        size: '1.2 MB',
        source: 'sample',
        url: '/sample-evidence/sample-evidence.pdf',
        uploadedAt: '2026-09-01 11:00'
      }
    ],
    timeline: [
      {
        id: 'tl-13',
        timestamp: '2026-09-01 10:45',
        title: 'Reported by Production Team',
        user: 'Meena R.',
        type: 'report'
      }
    ],
    comments: []
  },
  {
    id: 'ERR-00118',
    projectType: 'Scan',
    chapter: 'Chapter 14: Internationalization & Bidi',
    serverLocation: '/server/scan/raw-tiff/batch-1092/ch14.xhtml',
    isbnNumber: '978-1-119-54321-0',
    description: 'Skew distortion in double-page scan spreads exceeds 1.5-degree alignment tolerance, causing misaligned baseline crop and truncated header pagination.',
    expectedResult: 'Automated de-skew algorithm must align gutter margins within 0.25-degree vertical axis tolerance.',
    actualResult: 'Page 142 is rotated 1.8 degrees clockwise, causing cut-off running headers.',
    reportedBy: 'Devon Miller',
    source: 'Editor',
    assignedTo: 'Elena Vance',
    team: 'Design & Typesetting',
    priority: 'Medium',
    dueDate: '2026-09-01',
    status: 'Open',
    attachments: [],
    timeline: [
      {
        id: 'tl-14',
        timestamp: '2026-08-28 11:15',
        title: 'Reported by Managing Editor',
        user: 'Devon Miller',
        type: 'report'
      }
    ],
    comments: []
  },
  {
    id: 'ERR-00117',
    projectType: 'Scan',
    chapter: 'Chapter 12: Epilogue & Index',
    serverLocation: '/server/scan/batch-1400/index.xhtml',
    isbnNumber: '978-0-19-953556-9',
    description: 'Broken internal cross-reference target IDs in scanned backmatter index after OCR page number normalization.',
    expectedResult: 'All internal href hashes must resolve to matching id attributes in output spine documents.',
    actualResult: 'Target anchor #bio-arch-sec2 is not declared in Chapter 7 output XHTML.',
    reportedBy: 'Automated Check',
    source: 'Automated Check',
    assignedTo: 'Meena R.',
    team: 'Production Team',
    priority: 'Low',
    dueDate: '2026-08-30',
    status: 'Open',
    attachments: [],
    timeline: [
      {
        id: 'tl-15',
        timestamp: '2026-08-27 15:40',
        title: 'Reported by Automated Check',
        user: 'System Bot',
        type: 'report'
      }
    ],
    comments: []
  }
];
