const db = require('../config/db');
const initDb = require('./initDb');

const sampleBooks = [
  { isbn: '9781234567890', title: 'Advanced File Processing Workflows' },
  { isbn: '9780132350884', title: 'Clean Code: A Handbook of Agile Software' },
  { isbn: '9780201616224', title: 'The Pragmatic Programmer: 20th Anniversary' },
  { isbn: '9780596517748', title: 'JavaScript: The Good Parts' },
  { isbn: '9781449331818', title: 'Learning JavaScript Design Patterns' },
  { isbn: '9780321125217', title: 'Domain-Driven Design: Tackling Complexity' },
  { isbn: '9780134494166', title: 'Clean Architecture: A Craftsman\'s Guide' },
  { isbn: '9780262033848', title: 'Introduction to Algorithms (4th Edition)' },
  { isbn: '9780131103627', title: 'The C Programming Language (2nd Edition)' },
  { isbn: '9781491950296', title: 'Designing Data-Intensive Applications' },
  { isbn: '9780596007126', title: 'Head First Design Patterns' },
  { isbn: '9781491901427', title: 'Building Microservices: Designing Fine-Grained Systems' }
];

const sampleFeedbackItems = [
  // 9781234567890 - Multi-year history (2022 to 2026)
  {
    isbn: '9781234567890',
    title: 'Advanced File Processing Workflows',
    type: 'POSITIVE',
    rating: 5,
    customer: 'Sarah Jenkins',
    company: 'Apex Publishing Group',
    comment: 'Excellent print quality and crisp typography.',
    appreciation: 'The page margin and color grading were completely spotless.',
    critic: null,
    category: null,
    date: '2022-04-15 10:20:00'
  },
  {
    isbn: '9781234567890',
    title: 'Advanced File Processing Workflows',
    type: 'POSITIVE',
    rating: 5,
    customer: 'Marcus Vance',
    company: 'Vance Academic Press',
    comment: 'Very clear printing and flawless high-gloss cover.',
    appreciation: 'The vector diagrams came out exceptionally sharp.',
    critic: null,
    category: null,
    date: '2023-01-18 14:15:00'
  },
  {
    isbn: '9781234567890',
    title: 'Advanced File Processing Workflows',
    type: 'POSITIVE',
    rating: 4,
    customer: 'Elena Rostova',
    company: 'Nordic Book Services',
    comment: 'Nice cover art rendering and durable paper stock.',
    appreciation: 'Binding holds up very well under heavy bench review.',
    critic: null,
    category: null,
    date: '2024-03-22 09:30:00'
  },
  {
    isbn: '9781234567890',
    title: 'Advanced File Processing Workflows',
    type: 'NEGATIVE',
    rating: 2,
    customer: 'David Chen',
    company: 'Pacific Press Distribution',
    comment: 'Cover alignment issue on spine text.',
    appreciation: null,
    critic: 'The title text on the spine was shifted 3mm to the left, causing text wrapping over crease.',
    category: 'Cover Alignment',
    date: '2024-08-11 16:45:00'
  },
  {
    isbn: '9781234567890',
    title: 'Advanced File Processing Workflows',
    type: 'POSITIVE',
    rating: 5,
    customer: 'Amira Patel',
    company: 'Global Horizon Books',
    comment: 'Fast delivery and outstanding QC execution.',
    appreciation: 'Turnaround time was under 48 hours with zero defects on delivery.',
    critic: null,
    category: null,
    date: '2025-06-04 11:10:00'
  },
  {
    isbn: '9781234567890',
    title: 'Advanced File Processing Workflows',
    type: 'POSITIVE',
    rating: 5,
    customer: 'Liam O\'Connor',
    company: 'Dublin Scholastic Press',
    comment: 'Premium paper feel, binding is rock solid.',
    appreciation: 'Hardcover stitch binding is perfectly square and robust.',
    critic: null,
    category: null,
    date: '2026-02-14 15:30:00'
  },
  {
    isbn: '9781234567890',
    title: 'Advanced File Processing Workflows',
    type: 'POSITIVE',
    rating: 5,
    customer: 'Chloe Dupuis',
    company: 'Lumiere Media',
    comment: 'Perfect reproduction of full-color plates.',
    appreciation: 'CMYK color profile matching was 100% accurate to proof files.',
    critic: null,
    category: null,
    date: '2026-08-20 13:00:00'
  },

  // 9780132350884 - Clean Code (High Appreciation)
  {
    isbn: '9780132350884',
    title: 'Clean Code: A Handbook of Agile Software',
    type: 'POSITIVE',
    rating: 5,
    customer: 'Robert C. Miller',
    company: 'TechCraft Editions',
    comment: 'Gold standard formatting and immaculate layout alignment.',
    appreciation: 'Code block indentation and monospace fonts are crystal clear.',
    critic: null,
    category: null,
    date: '2023-05-10 11:00:00'
  },
  {
    isbn: '9780132350884',
    title: 'Clean Code: A Handbook of Agile Software',
    type: 'POSITIVE',
    rating: 5,
    customer: 'Hannah Schmidt',
    company: 'Berlin Dev Press',
    comment: 'Spotless POD delivery. Our engineering team was thrilled.',
    appreciation: 'Packaging prevented corner dings during transit.',
    critic: null,
    category: null,
    date: '2024-02-19 14:20:00'
  },
  {
    isbn: '9780132350884',
    title: 'Clean Code: A Handbook of Agile Software',
    type: 'POSITIVE',
    rating: 5,
    customer: 'Kenji Takahashi',
    company: 'Tokyo Tech Publications',
    comment: 'Flawless spine registration and smooth matte lamination.',
    appreciation: 'Lamination texture gives high perceived tactile value.',
    critic: null,
    category: null,
    date: '2025-01-12 09:15:00'
  },
  {
    isbn: '9780132350884',
    title: 'Clean Code: A Handbook of Agile Software',
    type: 'POSITIVE',
    rating: 4,
    customer: 'Lucia Morales',
    company: 'Iberia Bookworks',
    comment: 'Great text readability, slight delay on freight.',
    appreciation: 'Interior file preflight was done without any font dropouts.',
    critic: null,
    category: null,
    date: '2025-11-08 17:00:00'
  },
  {
    isbn: '9780132350884',
    title: 'Clean Code: A Handbook of Agile Software',
    type: 'POSITIVE',
    rating: 5,
    customer: 'Alexander Wright',
    company: 'Oxford Digital Prints',
    comment: 'Exceptional consistency across multiple 500-unit reprint runs.',
    appreciation: 'Batch-to-batch color consistency is the best we have seen.',
    critic: null,
    category: null,
    date: '2026-07-28 10:45:00'
  },

  // 9780201616224 - The Pragmatic Programmer
  {
    isbn: '9780201616224',
    title: 'The Pragmatic Programmer: 20th Anniversary',
    type: 'POSITIVE',
    rating: 5,
    customer: 'Jason Bourne',
    company: 'Treadstone Learning',
    comment: 'Brilliant foil stamping on cover title.',
    appreciation: 'Specialty finishing was executed to perfection.',
    critic: null,
    category: null,
    date: '2023-09-14 16:30:00'
  },
  {
    isbn: '9780201616224',
    title: 'The Pragmatic Programmer: 20th Anniversary',
    type: 'POSITIVE',
    rating: 5,
    customer: 'Rachel Green',
    company: 'Central Perk Press',
    comment: 'Crisp diagrams and deep black ink density.',
    appreciation: 'Rich black levels make reading in low light very comfortable.',
    critic: null,
    category: null,
    date: '2024-06-25 12:00:00'
  },
  {
    isbn: '9780201616224',
    title: 'The Pragmatic Programmer: 20th Anniversary',
    type: 'POSITIVE',
    rating: 5,
    customer: 'Vikram Sethi',
    company: 'Indus Valley Books',
    comment: 'High grade finishing and clean edge trim.',
    appreciation: 'Three-side knife trim is perfectly smooth without burrs.',
    critic: null,
    category: null,
    date: '2026-03-10 14:50:00'
  },

  // 9781491950296 - Designing Data-Intensive Applications (Mixed/Appreciated)
  {
    isbn: '9781491950296',
    title: 'Designing Data-Intensive Applications',
    type: 'POSITIVE',
    rating: 5,
    customer: 'Diana Prince',
    company: 'Themyscira Academic',
    comment: 'Superb heavyweight stock prevents ink bleed-through on charts.',
    appreciation: 'High opacity paper was selected appropriately for dense diagrams.',
    critic: null,
    category: null,
    date: '2024-04-10 15:10:00'
  },
  {
    isbn: '9781491950296',
    title: 'Designing Data-Intensive Applications',
    type: 'POSITIVE',
    rating: 4,
    customer: 'Bruce Wayne',
    company: 'Wayne Enterprises Library',
    comment: 'Solid construction, good jacket wrap.',
    appreciation: 'Dust jacket tuck folds were crisp and snug.',
    critic: null,
    category: null,
    date: '2025-05-18 11:40:00'
  },
  {
    isbn: '9781491950296',
    title: 'Designing Data-Intensive Applications',
    type: 'NEGATIVE',
    rating: 3,
    customer: 'Oliver Queen',
    company: 'Star City Media',
    comment: 'Minor color shift in Chapter 4 architectural diagrams.',
    appreciation: null,
    critic: 'Cyan tint was 15% too heavy in grayscale conversion for diagram figures.',
    category: 'Color Shift',
    date: '2025-10-02 08:30:00'
  },
  {
    isbn: '9781491950296',
    title: 'Designing Data-Intensive Applications',
    type: 'POSITIVE',
    rating: 5,
    customer: 'Barry Allen',
    company: 'Central City Press',
    comment: 'Fastest delivery yet! Arrived in mint condition.',
    appreciation: 'Expedited processing was completed within 24 hours.',
    critic: null,
    category: null,
    date: '2026-08-15 16:20:00'
  },

  // 9780596517748 - JavaScript: The Good Parts (Criticized Category Example)
  {
    isbn: '9780596517748',
    title: 'JavaScript: The Good Parts',
    type: 'NEGATIVE',
    rating: 1,
    customer: 'George Costanza',
    company: 'Vandelay Industries',
    comment: 'Binding failed within two weeks of reading.',
    appreciation: null,
    critic: 'Glue binding detached along pages 45-80. Inferior EVA adhesive used.',
    category: 'Binding Quality',
    date: '2023-11-12 10:05:00'
  },
  {
    isbn: '9780596517748',
    title: 'JavaScript: The Good Parts',
    type: 'NEGATIVE',
    rating: 2,
    customer: 'Cosmo Kramer',
    company: 'Kramerica Publishing',
    comment: 'Repeated spine cracking and loose pages.',
    appreciation: null,
    critic: 'The thermal binding spine lacks sufficient glue penetration into signatures.',
    category: 'Binding Quality',
    date: '2024-07-19 13:40:00'
  },
  {
    isbn: '9780596517748',
    title: 'JavaScript: The Good Parts',
    type: 'NEGATIVE',
    rating: 2,
    customer: 'Elaine Benes',
    company: 'Pendant Publishing',
    comment: 'Spine hinge crease was mispositioned.',
    appreciation: null,
    critic: 'Scoring wheel was offset by 4mm causing jagged opening crease.',
    category: 'Spine Alignment',
    date: '2025-03-24 15:15:00'
  },
  {
    isbn: '9780596517748',
    title: 'JavaScript: The Good Parts',
    type: 'NEGATIVE',
    rating: 1,
    customer: 'Newman Post',
    company: 'USPS Literary Guild',
    comment: 'Pages falling out of paperback batch.',
    appreciation: null,
    critic: 'Pur-glue curing was incomplete, whole section separated on first flex.',
    category: 'Binding Quality',
    date: '2026-01-30 09:00:00'
  },
  {
    isbn: '9780596517748',
    title: 'JavaScript: The Good Parts',
    type: 'POSITIVE',
    rating: 4,
    customer: 'Jerry Seinfeld',
    company: 'Comedy Club Editions',
    comment: 'Replacement batch fixed the glue issues completely.',
    appreciation: 'Customer support promptly re-ran the job with PUR adhesive.',
    critic: null,
    category: null,
    date: '2026-06-12 11:30:00'
  },

  // 9781449331818 - Learning JavaScript Design Patterns (Trim / Margin Criticized)
  {
    isbn: '9781449331818',
    title: 'Learning JavaScript Design Patterns',
    type: 'NEGATIVE',
    rating: 2,
    customer: 'Arthur Dent',
    company: 'Galactic Press',
    comment: 'Header text cut off near top trim margin.',
    appreciation: null,
    critic: 'Top margin was only 3mm instead of specified 12mm safe zone.',
    category: 'Trim Margin',
    date: '2024-01-15 14:00:00'
  },
  {
    isbn: '9781449331818',
    title: 'Learning JavaScript Design Patterns',
    type: 'NEGATIVE',
    rating: 1,
    customer: 'Ford Prefect',
    company: 'Megadodo Publications',
    comment: 'Page numbers clipped on odd pages.',
    appreciation: null,
    critic: 'Guillotine blade drifted during trimming, slicing into folio numbers.',
    category: 'Trim Margin',
    date: '2024-09-28 10:20:00'
  },
  {
    isbn: '9781449331818',
    title: 'Learning JavaScript Design Patterns',
    type: 'NEGATIVE',
    rating: 2,
    customer: 'Tricia McMillan',
    company: 'Sub-Etha Media',
    comment: 'Uneven margins throughout chapter 7.',
    appreciation: null,
    critic: 'Imposition layout template had mismatched gutter margins.',
    category: 'Trim Margin',
    date: '2025-04-14 16:50:00'
  },
  {
    isbn: '9781449331818',
    title: 'Learning JavaScript Design Patterns',
    type: 'POSITIVE',
    rating: 4,
    customer: 'Zaphod Beeblebrox',
    company: 'Heart of Gold Media',
    comment: 'Print colors look flashy and bright.',
    appreciation: 'Cover UV gloss coating is vibrant and eye-catching.',
    critic: null,
    category: null,
    date: '2026-05-09 12:10:00'
  },

  // 9780321125217 - Domain-Driven Design
  {
    isbn: '9780321125217',
    title: 'Domain-Driven Design: Tackling Complexity',
    type: 'POSITIVE',
    rating: 5,
    customer: 'Eric Evanson',
    company: 'Blue Book Society',
    comment: 'Magnificent hardcover binding and silk bookmark ribbon.',
    appreciation: 'High-end ribbon placement and headband stitching look luxurious.',
    critic: null,
    category: null,
    date: '2023-08-05 13:20:00'
  },
  {
    isbn: '9780321125217',
    title: 'Domain-Driven Design: Tackling Complexity',
    type: 'POSITIVE',
    rating: 5,
    customer: 'Vaughn Vernon',
    company: 'Actor Model Press',
    comment: 'Crisp interior text, deep indigo cloth cover.',
    appreciation: 'Cloth stamping foil has zero flaking or edge bleed.',
    critic: null,
    category: null,
    date: '2024-12-01 10:30:00'
  },
  {
    isbn: '9780321125217',
    title: 'Domain-Driven Design: Tackling Complexity',
    type: 'POSITIVE',
    rating: 5,
    customer: 'Martin Fowler',
    company: 'Refactor Academic',
    comment: 'Consistent page registration and sharp serif glyphs.',
    appreciation: 'Font rendering on fine punctuation is razor sharp.',
    critic: null,
    category: null,
    date: '2025-08-19 14:15:00'
  },
  {
    isbn: '9780321125217',
    title: 'Domain-Driven Design: Tackling Complexity',
    type: 'POSITIVE',
    rating: 5,
    customer: 'Rebecca Parsons',
    company: 'ThoughtWorks Books',
    comment: 'Durable library-grade binding that withstands heavy circulation.',
    appreciation: 'Reinforced endpapers provide great strength.',
    critic: null,
    category: null,
    date: '2026-08-02 09:40:00'
  },

  // 9780134494166 - Clean Architecture
  {
    isbn: '9780134494166',
    title: 'Clean Architecture: A Craftsman\'s Guide',
    type: 'POSITIVE',
    rating: 5,
    customer: 'Linus Torvalds',
    company: 'Kernel Press',
    comment: 'Clean layout, zero printing errors encountered.',
    appreciation: 'Diagrammatic clarity and contrast are superb.',
    critic: null,
    category: null,
    date: '2023-10-30 15:45:00'
  },
  {
    isbn: '9780134494166',
    title: 'Clean Architecture: A Craftsman\'s Guide',
    type: 'POSITIVE',
    rating: 4,
    customer: 'Grace Hopper',
    company: 'Naval Computing Press',
    comment: 'Good paper quality, smooth page turning.',
    appreciation: 'High bulk 60lb cream paper provides comfortable reading weight.',
    critic: null,
    category: null,
    date: '2024-11-14 11:25:00'
  },
  {
    isbn: '9780134494166',
    title: 'Clean Architecture: A Craftsman\'s Guide',
    type: 'POSITIVE',
    rating: 5,
    customer: 'Ada Lovelace',
    company: 'Babbage Editions',
    comment: 'Impeccable cover varnish and solid construction.',
    appreciation: 'Spot UV varnish highlights author name and architecture ring beautifully.',
    critic: null,
    category: null,
    date: '2025-09-08 17:05:00'
  },
  {
    isbn: '9780134494166',
    title: 'Clean Architecture: A Craftsman\'s Guide',
    type: 'POSITIVE',
    rating: 5,
    customer: 'Margaret Hamilton',
    company: 'Apollo Software Lib',
    comment: 'Super fast production turnaround and flawless delivery.',
    appreciation: 'Zero scuff marks on covers upon unpacking.',
    critic: null,
    category: null,
    date: '2026-08-25 13:50:00'
  },

  // 9780262033848 - Introduction to Algorithms
  {
    isbn: '9780262033848',
    title: 'Introduction to Algorithms (4th Edition)',
    type: 'POSITIVE',
    rating: 5,
    customer: 'Donald Knuth',
    company: 'Stanford CS Guild',
    comment: 'Massive 1300-page tome bound with remarkable structural integrity.',
    appreciation: 'Smyth-sewn binding lies completely flat on desk without stress.',
    critic: null,
    category: null,
    date: '2023-03-01 10:00:00'
  },
  {
    isbn: '9780262033848',
    title: 'Introduction to Algorithms (4th Edition)',
    type: 'POSITIVE',
    rating: 4,
    customer: 'Charles Leiserson',
    company: 'MIT Algorithms Lab',
    comment: 'Clear math formula rendering and deep black tone.',
    appreciation: 'Math symbols and subscripts did not show any pixelation or dropout.',
    critic: null,
    category: null,
    date: '2024-05-19 14:10:00'
  },
  {
    isbn: '9780262033848',
    title: 'Introduction to Algorithms (4th Edition)',
    type: 'NEGATIVE',
    rating: 2,
    customer: 'Ron Rivest',
    company: 'Cryptography Press',
    comment: 'Delayed delivery on classroom textbook orders.',
    appreciation: null,
    critic: 'Shipment was dispatched 6 days after promised deadline, missing semester start.',
    category: 'Delayed Delivery',
    date: '2025-02-17 08:45:00'
  },
  {
    isbn: '9780262033848',
    title: 'Introduction to Algorithms (4th Edition)',
    type: 'POSITIVE',
    rating: 5,
    customer: 'Clifford Stein',
    company: 'Columbia Academic',
    comment: 'Outstanding cover gloss and sturdy box packaging.',
    appreciation: 'Double-walled carton protected heavy books during overseas transit.',
    critic: null,
    category: null,
    date: '2026-04-18 16:30:00'
  },

  // 9780131103627 - The C Programming Language
  {
    isbn: '9780131103627',
    title: 'The C Programming Language (2nd Edition)',
    type: 'POSITIVE',
    rating: 5,
    customer: 'Dennis Ritchie',
    company: 'Bell Labs Memorial',
    comment: 'Classic compact format printed with utmost respect and clarity.',
    appreciation: 'True to original typography and compact paperback dimensions.',
    critic: null,
    category: null,
    date: '2022-11-15 11:30:00'
  },
  {
    isbn: '9780131103627',
    title: 'The C Programming Language (2nd Edition)',
    type: 'POSITIVE',
    rating: 5,
    customer: 'Brian Kernighan',
    company: 'Princeton Computing',
    comment: 'Crisp font rendering and sturdy spine.',
    appreciation: 'Paperback spine does not crack even when bent open.',
    critic: null,
    category: null,
    date: '2024-08-04 15:20:00'
  },
  {
    isbn: '9780131103627',
    title: 'The C Programming Language (2nd Edition)',
    type: 'POSITIVE',
    rating: 5,
    customer: 'Ken Thompson',
    company: 'Unix Heritage Org',
    comment: 'Spotless print run, delivered ahead of schedule.',
    appreciation: 'Pre-flight QC detected and fixed low-res diagrams automatically.',
    critic: null,
    category: null,
    date: '2026-03-29 09:10:00'
  },

  // 9780596007126 - Head First Design Patterns (Color Shift / Print Issues)
  {
    isbn: '9780596007126',
    title: 'Head First Design Patterns',
    type: 'NEGATIVE',
    rating: 2,
    customer: 'Eric Freeman',
    company: 'Brainy Media',
    comment: 'Color shift in cartoon illustrations.',
    appreciation: null,
    critic: 'Magenta ink density was too high causing faces to appear reddish-pink.',
    category: 'Color Shift',
    date: '2024-10-10 11:00:00'
  },
  {
    isbn: '9780596007126',
    title: 'Head First Design Patterns',
    type: 'NEGATIVE',
    rating: 3,
    customer: 'Elisabeth Robson',
    company: 'Wickedly Smart Press',
    comment: 'Some ghosting on high coverage pages.',
    appreciation: null,
    critic: 'Backside ink show-through on 50lb stock. Should use 60lb opaque paper.',
    category: 'Page Bleed',
    date: '2025-06-20 14:40:00'
  },
  {
    isbn: '9780596007126',
    title: 'Head First Design Patterns',
    type: 'POSITIVE',
    rating: 4,
    customer: 'Kathy Sierra',
    company: 'Mind Gym Press',
    comment: 'Playful font layouts reproduced cleanly.',
    appreciation: 'Complex multi-font collage pages were aligned perfectly without raster blur.',
    critic: null,
    category: null,
    date: '2026-07-05 13:15:00'
  },

  // 9781491901427 - Building Microservices
  {
    isbn: '9781491901427',
    title: 'Building Microservices: Designing Fine-Grained Systems',
    type: 'POSITIVE',
    rating: 5,
    customer: 'Sam Newman',
    company: 'Distributed Systems UK',
    comment: 'Crisp diagrams, beautiful matte softcover.',
    appreciation: 'Soft touch velvet lamination on cover feels premium.',
    critic: null,
    category: null,
    date: '2024-03-05 10:15:00'
  },
  {
    isbn: '9781491901427',
    title: 'Building Microservices: Designing Fine-Grained Systems',
    type: 'POSITIVE',
    rating: 5,
    customer: 'Martin Kleppmann',
    company: 'Cambridge Systems',
    comment: 'Accurate margins and flawless binding.',
    appreciation: 'Gutter margins allow reading inner code snippets without forcing book open.',
    critic: null,
    category: null,
    date: '2025-12-14 16:30:00'
  },
  {
    isbn: '9781491901427',
    title: 'Building Microservices: Designing Fine-Grained Systems',
    type: 'POSITIVE',
    rating: 4,
    customer: 'Adrian Cockcroft',
    company: 'Cloud Architects Guild',
    comment: 'Very good printing quality and on-time delivery.',
    appreciation: 'Delivery tracker gave accurate minute-by-minute updates.',
    critic: null,
    category: null,
    date: '2026-08-30 11:20:00'
  },
  // Recent feedback in late 2026 (this week / this month)
  {
    isbn: '9781234567890',
    title: 'Advanced File Processing Workflows',
    type: 'POSITIVE',
    rating: 5,
    customer: 'Sophia Turner',
    company: 'Apex Media',
    comment: 'Outstanding quality in the latest September reprint batch!',
    appreciation: 'The spine thickness calculation was exact and fits the slipcase perfectly.',
    critic: null,
    category: null,
    date: '2026-09-02 10:15:00'
  },
  {
    isbn: '9780132350884',
    title: 'Clean Code: A Handbook of Agile Software',
    type: 'POSITIVE',
    rating: 5,
    customer: 'Daniel Lee',
    company: 'NextGen Coding Labs',
    comment: 'Super crisp code blocks and rapid turnaround this week.',
    appreciation: 'Delivered in under 36 hours with zero defect rate.',
    critic: null,
    category: null,
    date: '2026-09-04 14:00:00'
  }
];

async function seed() {
  await initDb();

  console.log('Seeding initial users...');
  // Check if users exist
  const existingUsers = await db.all('SELECT * FROM users');
  if (existingUsers.length === 0) {
    const bcrypt = require('bcryptjs');
    const adminPass = await bcrypt.hash('admin123', 10);
    const employeePass = await bcrypt.hash('emp123', 10);

    await db.run(
      `INSERT INTO users (id, name, email, password_hash, role) VALUES 
       ('usr_admin_1', 'System Administrator', 'admin@fms.com', ?, 'ADMIN'),
       ('usr_mgr_1', 'Operations Manager', 'manager@fms.com', ?, 'MANAGER'),
       ('usr_emp_1', 'John Developer (POD)', 'developer@fms.com', ?, 'EMPLOYEE')`,
      [adminPass, adminPass, employeePass]
    );
    console.log('Created default users: admin@fms.com (ADMIN), developer@fms.com (EMPLOYEE)');
  }

  console.log('Checking customer_feedback table...');
  const feedbackCountRow = await db.get('SELECT COUNT(*) as count FROM customer_feedback');
  if (feedbackCountRow.count === 0) {
    console.log('Seeding multi-year customer feedback history (2022-2026)...');
    let counter = 100;
    for (const item of sampleFeedbackItems) {
      counter++;
      const id = `fb_${Date.now()}_${counter}_${Math.random().toString(36).substring(2, 7)}`;
      const year = item.date.substring(0, 4);
      const feedbackNumber = `FB-${year}-${String(counter).padStart(5, '0')}`;

      await db.run(
        `INSERT INTO customer_feedback (
          id, feedback_number, isbn, title, feedback_type, rating,
          customer_name, customer_company, comment,
          appreciation_message, critic_message, critic_category,
          submitted_at, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          feedbackNumber,
          item.isbn,
          item.title,
          item.type,
          item.rating,
          item.customer,
          item.company,
          item.comment,
          item.appreciation,
          item.critic,
          item.category,
          item.date,
          item.date,
          item.date
        ]
      );
    }
    console.log(`Successfully seeded ${sampleFeedbackItems.length} customer feedback records across 2022-2026!`);
  } else {
    console.log(`customer_feedback table already has ${feedbackCountRow.count} records.`);
  }
}

if (require.main === module) {
  seed()
    .then(() => {
      console.log('Seeding completed.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Seeding failed:', err);
      process.exit(1);
    });
}

module.exports = seed;

