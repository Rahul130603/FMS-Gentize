import { BookProject, User } from '../types/common';

export const INITIAL_BOOKS: BookProject[] = [
  {
    id: 'book-001',
    title: 'The Art of Modern Living',
    projectCode: 'PUB-AML-2026',
    isbn: '978-0-14-312774-1',
    edition: '2nd Edition (Revised)',
    author: 'Elena Vance & Marcus Thorne',
    format: 'EPUB 3.2 (Reflowable)',
    status: 'QA & Validation',
    chaptersCount: 16,
    coverColor: 'from-amber-600 to-orange-800'
  },
  {
    id: 'book-002',
    title: 'Digital Publishing Guide',
    projectCode: 'PUB-DPG-2026',
    isbn: '978-1-59327-928-8',
    edition: '4th Edition',
    author: 'Dr. Sarah Jenkins',
    format: 'EPUB 3.2 (Reflowable)',
    status: 'Typesetting',
    chaptersCount: 22,
    coverColor: 'from-blue-600 to-indigo-900'
  },
  {
    id: 'book-003',
    title: 'Understanding Typography',
    projectCode: 'PUB-UNT-2026',
    isbn: '978-0-262-53658-5',
    edition: '1st Edition',
    author: 'Lucas Van Der Berg',
    format: 'EPUB 3.2 (Fixed-Layout)',
    status: 'Conversion',
    chaptersCount: 12,
    coverColor: 'from-emerald-600 to-teal-900'
  },
  {
    id: 'book-004',
    title: 'EPUB Accessibility Handbook',
    projectCode: 'PUB-EAH-2026',
    isbn: '978-1-4919-8472-7',
    edition: '3rd Edition',
    author: 'Matt Garrish & Charles LaPierre',
    format: 'EPUB 3.2 (Reflowable)',
    status: 'QA & Validation',
    chaptersCount: 18,
    coverColor: 'from-purple-600 to-indigo-950'
  },
  {
    id: 'book-005',
    title: 'Modern Publishing Workflow',
    projectCode: 'PUB-MPW-2026',
    isbn: '978-0-321-94856-4',
    edition: '2nd Edition',
    author: 'Devon Miller & Priya Sharma',
    format: 'Multi-Format (EPUB/PDF/Mobi)',
    status: 'Sign-off',
    chaptersCount: 14,
    coverColor: 'from-rose-600 to-pink-900'
  },
  {
    id: 'book-006',
    title: 'Accessible EPUB Production',
    projectCode: 'PUB-AEP-2026',
    isbn: '978-0-13-468599-1',
    edition: '1st Edition',
    author: 'Rachel Lin & Arun Kumar',
    format: 'EPUB 3.2 (Reflowable)',
    status: 'Conversion',
    chaptersCount: 20,
    coverColor: 'from-cyan-600 to-blue-900'
  },
  {
    id: 'book-007',
    title: 'Publishing Standards Guide',
    projectCode: 'PUB-PSG-2026',
    isbn: '978-1-119-54321-0',
    edition: '5th Edition',
    author: 'W3C Publishing Working Group',
    format: 'EPUB 3.0',
    status: 'Draft',
    chaptersCount: 28,
    coverColor: 'from-slate-700 to-slate-900'
  }
];

export const TEAM_MEMBERS: User[] = [
  {
    id: 'user-1',
    name: 'Priya S.',
    email: 'priya.sharma@pubvantage.io',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    role: 'Lead Accessibility Engineer',
    team: 'Accessibility Team'
  },
  {
    id: 'user-2',
    name: 'Arun K.',
    email: 'arun.kumar@pubvantage.io',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    role: 'Senior EPUB Developer',
    team: 'Production Team'
  },
  {
    id: 'user-3',
    name: 'Rahul M.',
    email: 'rahul.mehta@pubvantage.io',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    role: 'Quality Assurance Lead',
    team: 'QA Team'
  },
  {
    id: 'user-4',
    name: 'Meena R.',
    email: 'meena.rao@pubvantage.io',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
    role: 'Production Specialist',
    team: 'Production Team'
  },
  {
    id: 'user-5',
    name: 'Devon Miller',
    email: 'devon.miller@pubvantage.io',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80',
    role: 'Managing Editor',
    team: 'Editorial Team'
  },
  {
    id: 'user-6',
    name: 'Elena Vance',
    email: 'elena.vance@pubvantage.io',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80',
    role: 'Senior Typesetter',
    team: 'Design & Typesetting'
  }
];
