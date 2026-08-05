// Mock data & service layer
// Simulates API calls with realistic data. Replace API.get/post with real calls when backend is ready.

export const MOCK_USER_STUDENT = {
  id: 1,
  full_name: 'Ankit Sharma',
  email: 'ankit@example.com',
  roles: ['Student'],
  is_active: true,
  created_at: '2024-01-10T09:00:00Z',
  avatar_initials: 'AS',
  department: 'Computer Science',
  enrollment_no: 'CS2021001',
  semester: '6th Semester',
  university: 'Chandigarh University',
};

export const MOCK_USER_FACULTY = {
  id: 2,
  full_name: 'Dr. Priya Singh',
  email: 'priya.singh@cu.ac.in',
  roles: ['Faculty'],
  is_active: true,
  created_at: '2021-06-01T09:00:00Z',
  avatar_initials: 'PS',
  department: 'Computer Science',
  designation: 'Associate Professor',
  university: 'Chandigarh University',
};

export const MOCK_USER_ADMIN = {
  id: 3,
  full_name: 'Admin User',
  email: 'admin@cu.ac.in',
  roles: ['Admin'],
  is_active: true,
  avatar_initials: 'AU',
};

export const MOCK_USER_RECRUITER = {
  id: 4,
  full_name: 'Rahul Verma',
  email: 'rahul@techcorp.com',
  roles: ['Recruiter'],
  is_active: true,
  avatar_initials: 'RV',
  company: 'TechCorp Solutions',
};

export const MOCK_UPCOMING_EXAMS = [
  { id: 1, subject: 'Data Structures', type: 'Mid Term Exam', date: '20 May 2024', time: '10:00 AM', duration: 60, status: 'upcoming' },
  { id: 2, subject: 'Database Management', type: 'Quiz', date: '22 May 2024', time: '02:00 PM', duration: 30, status: 'upcoming' },
  { id: 3, subject: 'Operating Systems', type: 'Assignment', date: '25 May 2024', time: '11:00 AM', duration: 90, status: 'upcoming' },
];

export const MOCK_PAST_EXAMS = [
  { id: 4, subject: 'Algorithms', type: 'Mid Term', date: '10 Apr 2024', score: 88, total: 100, rank: 3, status: 'completed' },
  { id: 5, subject: 'Computer Networks', type: 'Quiz', date: '5 Apr 2024', score: 72, total: 100, rank: 8, status: 'completed' },
  { id: 6, subject: 'Software Engineering', type: 'Final Exam', date: '1 Apr 2024', score: 91, total: 100, rank: 2, status: 'completed' },
];

export const MOCK_PERFORMANCE_DATA = [
  { month: '1 May', score: 65 },
  { month: '8 May', score: 72 },
  { month: '15 May', score: 68 },
  { month: '22 May', score: 85 },
  { month: '29 May', score: 88 },
];

export const MOCK_QUESTIONS = [
  { id: 1, text: 'What is the time complexity of binary search?', subject: 'Data Structures', type: 'MCQ', difficulty: 'Easy', marks: 2, options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'], correct: 1 },
  { id: 2, text: 'Explain Binary Search Tree insertion and deletion with examples.', subject: 'Data Structures', type: 'Descriptive', difficulty: 'Medium', marks: 5, options: [], correct: null },
  { id: 3, text: 'What is a foreign key constraint in RDBMS?', subject: 'Database', type: 'MCQ', difficulty: 'Easy', marks: 2, options: ['Primary identifier', 'Cross-table reference', 'Unique constraint', 'Null constraint'], correct: 1 },
  { id: 4, text: 'Normalize the given relation to 3rd Normal Form (3NF).', subject: 'Database', type: 'Descriptive', difficulty: 'Hard', marks: 5, options: [], correct: null },
  { id: 5, text: 'What is deadlock in Operating Systems?', subject: 'Operating Systems', type: 'MCQ', difficulty: 'Medium', marks: 2, options: ['Process blocked forever', 'Memory overflow', 'CPU starvation', 'Disk failure'], correct: 0 },
  { id: 6, text: 'Which sorting algorithm has O(n log n) average time complexity?', subject: 'Algorithms', type: 'MCQ', difficulty: 'Easy', marks: 2, options: ['Bubble Sort', 'Insertion Sort', 'Merge Sort', 'Selection Sort'], correct: 2 },
  { id: 7, text: 'What is the purpose of the TCP three-way handshake?', subject: 'Computer Networks', type: 'MCQ', difficulty: 'Medium', marks: 2, options: ['Data encryption', 'Connection establishment', 'File transfer', 'DNS resolution'], correct: 1 },
];

export const MOCK_EXAM_QUESTIONS = [
  { id: 1,  text: 'What is the time complexity of binary search?', type: 'MCQ', difficulty: 'Medium', marks: 2, options: { A: 'O(n)', B: 'O(log n)', C: 'O(n log n)', D: 'O(1)' } },
  { id: 2,  text: 'Which data structure uses LIFO order?', type: 'MCQ', difficulty: 'Easy', marks: 2, options: { A: 'Queue', B: 'Array', C: 'Stack', D: 'Tree' } },
  { id: 3,  text: 'What is the height of a complete binary tree with N nodes?', type: 'MCQ', difficulty: 'Medium', marks: 2, options: { A: 'O(N)', B: 'O(log N)', C: 'O(N²)', D: 'O(1)' } },
  { id: 4,  text: 'Which traversal visits root node first?', type: 'MCQ', difficulty: 'Easy', marks: 2, options: { A: 'Inorder', B: 'Postorder', C: 'Preorder', D: 'Level order' } },
  { id: 5,  text: 'What is a balanced BST?', type: 'MCQ', difficulty: 'Medium', marks: 2, options: { A: 'AVL Tree', B: 'B+ Tree', C: 'Splay Tree', D: 'Segment Tree' } },
  { id: 6,  text: 'Worst case time complexity of Quick Sort is?', type: 'MCQ', difficulty: 'Hard', marks: 2, options: { A: 'O(n)', B: 'O(n log n)', C: 'O(n²)', D: 'O(log n)' } },
  { id: 7,  text: 'Which graph traversal uses a FIFO queue?', type: 'MCQ', difficulty: 'Easy', marks: 2, options: { A: 'DFS', B: 'BFS', C: 'Dijkstra', D: 'Prim' } },
  { id: 8,  text: 'In a min-heap, the root element is?', type: 'MCQ', difficulty: 'Easy', marks: 2, options: { A: 'Maximum', B: 'Median', C: 'Minimum', D: 'Random' } },
  { id: 9,  text: 'What is dynamic programming?', type: 'MCQ', difficulty: 'Hard', marks: 2, options: { A: 'Greedy approach', B: 'Divide & Conquer', C: 'Memoization + subproblems', D: 'Backtracking' } },
  { id: 10, text: 'Hash table collision resolution strategy?', type: 'MCQ', difficulty: 'Medium', marks: 2, options: { A: 'Chaining', B: 'Sorting', C: 'Filtering', D: 'Parsing' } },
  { id: 11, text: 'Which algorithm finds shortest path in a weighted graph?', type: 'MCQ', difficulty: 'Medium', marks: 2, options: { A: 'Kruskal', B: 'Prim', C: "Dijkstra's", D: 'Floyd-Warshall' } },
  { id: 12, text: 'What is a trie data structure used for?', type: 'MCQ', difficulty: 'Medium', marks: 2, options: { A: 'String prefix matching', B: 'Sorting integers', C: 'Graph traversal', D: 'Matrix operations' } },
  { id: 13, text: 'Self-balancing BST that maintains balance using rotations?', type: 'MCQ', difficulty: 'Hard', marks: 2, options: { A: 'B-Tree', B: 'AVL Tree', C: 'Red-Black Tree', D: 'Both B & C' } },
  { id: 14, text: 'Space complexity of merge sort?', type: 'MCQ', difficulty: 'Medium', marks: 2, options: { A: 'O(1)', B: 'O(log n)', C: 'O(n)', D: 'O(n²)' } },
  { id: 15, text: 'Which operation is not O(1) in a hash table?', type: 'MCQ', difficulty: 'Hard', marks: 2, options: { A: 'Insert', B: 'Delete', C: 'Search in worst case', D: 'None of above' } },
  { id: 16, text: 'Inorder traversal of BST gives?', type: 'MCQ', difficulty: 'Easy', marks: 2, options: { A: 'Random order', B: 'Descending order', C: 'Sorted ascending order', D: 'Level order' } },
  { id: 17, text: 'What is amortized analysis?', type: 'MCQ', difficulty: 'Hard', marks: 2, options: { A: 'Worst-case only', B: 'Average cost over a sequence', C: 'Space complexity only', D: 'Best-case analysis' } },
  { id: 18, text: 'Disjoint Set Union (DSU) data structure supports?', type: 'MCQ', difficulty: 'Hard', marks: 2, options: { A: 'Sorting', B: 'Union-Find operations', C: 'Shortest path', D: 'Hashing' } },
  { id: 19, text: 'Which of the following is NOT a greedy algorithm?', type: 'MCQ', difficulty: 'Medium', marks: 2, options: { A: "Dijkstra's", B: "Prim's", C: 'Bellman-Ford', D: "Kruskal's" } },
  { id: 20, text: 'Segment tree is primarily used for?', type: 'MCQ', difficulty: 'Hard', marks: 2, options: { A: 'Graph traversal', B: 'String matching', C: 'Range queries', D: 'Sorting' } },
];

export const MOCK_CANDIDATES = [
  { id: 1, name: 'Ankit Sharma', degree: 'MCA', university: 'Chandigarh University', skills: ['Java', 'Angular', 'SQL'], sci_score: 92, ep: 0.90, vp: 0.94, available: true },
  { id: 2, name: 'Priya Singh',  degree: 'B.Tech', university: 'PU', skills: ['Python', 'Django', 'AI/ML'], sci_score: 90, ep: 0.88, vp: 0.92, available: true },
  { id: 3, name: 'Rahul Verma',  degree: 'MCA', university: 'UIET', skills: ['.NET', 'SQL Server', 'Azure'], sci_score: 88, ep: 0.85, vp: 0.91, available: false },
  { id: 4, name: 'Sneha Patel',  degree: 'B.Tech', university: 'Chandigarh University', skills: ['Java', 'Spring Boot', 'Hibernate'], sci_score: 85, ep: 0.83, vp: 0.87, available: true },
  { id: 5, name: 'Amit Kumar',   degree: 'MCA', university: 'MDU', skills: ['React', 'Node.js', 'MongoDB'], sci_score: 83, ep: 0.80, vp: 0.86, available: true },
];

// Simulate async API
export const sleep = (ms = 600) => new Promise(r => setTimeout(r, ms));

export const mockLogin = async (email, password) => {
  await sleep(800);
  if (email === 'admin@cu.ac.in' && password === 'password') return MOCK_USER_ADMIN;
  if (email === 'priya.singh@cu.ac.in' && password === 'password') return MOCK_USER_FACULTY;
  if (email === 'rahul@techcorp.com' && password === 'password') return MOCK_USER_RECRUITER;
  if (password === 'password') return { ...MOCK_USER_STUDENT, email, full_name: email.split('@')[0] };
  throw new Error('Invalid email or password. Use any email with password: password');
};
