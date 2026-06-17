export interface ColumnDefinition {
  name: string;
  type: 'NUMBER' | 'STRING' | 'DATE';
  isPrimary?: boolean;
  isForeign?: boolean;
  references?: string; // "table.column"
}

export interface TableData {
  name: string;
  columns: ColumnDefinition[];
  rows: Record<string, any>[];
  description: string;
}

export const datasets: Record<string, TableData> = {
  employees: {
    name: 'employees',
    description: 'Corporate staff and compensation data',
    columns: [
      { name: 'id', type: 'NUMBER', isPrimary: true },
      { name: 'name', type: 'STRING' },
      { name: 'age', type: 'NUMBER' },
      { name: 'salary', type: 'NUMBER' },
      { name: 'department_id', type: 'NUMBER', isForeign: true, references: 'departments.id' },
      { name: 'role', type: 'STRING' }
    ],
    rows: [
      { id: 1, name: 'Alice Smith', age: 34, salary: 85000, department_id: 1, role: 'Software Engineer' },
      { id: 2, name: 'Bob Jones', age: 41, salary: 92000, department_id: 1, role: 'Tech Lead' },
      { id: 3, name: 'Charlie Brown', age: 28, salary: 54000, department_id: 2, role: 'HR Specialist' },
      { id: 4, name: 'Diana Prince', age: 30, salary: 110000, department_id: 3, role: 'Product Manager' },
      { id: 5, name: 'Evan Wright', age: 25, salary: 48000, department_id: 2, role: 'Recruiter' },
      { id: 6, name: 'Fiona Gallagher', age: 32, salary: 75000, department_id: 1, role: 'QA Engineer' },
      { id: 7, name: 'George Costanza', age: 45, salary: 45000, department_id: 4, role: 'Assistant to GM' },
      { id: 8, name: 'Harriet Tub', age: 29, salary: 62000, department_id: 3, role: 'UX Designer' },
      { id: 9, name: 'Ian Malcolm', age: 52, salary: 125000, department_id: 5, role: 'Research Fellow' },
      { id: 10, name: 'Julia Roberts', age: 38, salary: 95000, department_id: 3, role: 'Content Strategist' },
      { id: 11, name: 'Kevin Hart', age: 31, salary: 51000, department_id: 4, role: 'Clerk' },
      { id: 12, name: 'Laura Croft', age: 27, salary: 88000, department_id: 5, role: 'Security Analyst' }
    ]
  },
  departments: {
    name: 'departments',
    description: 'Corporate organizational divisions',
    columns: [
      { name: 'id', type: 'NUMBER', isPrimary: true },
      { name: 'department_name', type: 'STRING' },
      { name: 'manager_id', type: 'NUMBER' },
      { name: 'budget', type: 'NUMBER' },
      { name: 'building', type: 'STRING' }
    ],
    rows: [
      { id: 1, department_name: 'Engineering', manager_id: 2, budget: 1500000, building: 'Silicon Tower A' },
      { id: 2, department_name: 'Human Resources', manager_id: 3, budget: 300000, building: 'East Annex' },
      { id: 3, department_name: 'Product & Design', manager_id: 4, budget: 800000, building: 'Silicon Tower B' },
      { id: 4, department_name: 'Administration', manager_id: 7, budget: 200000, building: 'Old Depot' },
      { id: 5, department_name: 'Research & Dev', manager_id: 9, budget: 1200000, building: 'The Lab' }
    ]
  },
  customers: {
    name: 'customers',
    description: 'Client details and signup data',
    columns: [
      { name: 'id', type: 'NUMBER', isPrimary: true },
      { name: 'name', type: 'STRING' },
      { name: 'email', type: 'STRING' },
      { name: 'country', type: 'STRING' },
      { name: 'join_date', type: 'STRING' }
    ],
    rows: [
      { id: 101, name: 'John Doe', email: 'john.doe@gmail.com', country: 'USA', join_date: '2025-01-15' },
      { id: 102, name: 'Marie Curie', email: 'marie.curie@sciences.fr', country: 'France', join_date: '2024-11-20' },
      { id: 103, name: 'Satoshi Nakamoto', email: 'satoshi@gmx.com', country: 'Japan', join_date: '2023-09-08' },
      { id: 104, name: 'Ada Lovelace', email: 'ada.l@comp.co.uk', country: 'UK', join_date: '2024-05-12' },
      { id: 105, name: 'Nelson Mandela', email: 'nelson@foundation.org.za', country: 'South Africa', join_date: '2025-03-01' },
      { id: 106, name: 'Albert Einstein', email: 'albert@princeton.edu', country: 'Germany', join_date: '2024-08-30' },
      { id: 107, name: 'Grace Hopper', email: 'grace.h@navy.mil', country: 'USA', join_date: '2024-02-14' }
    ]
  },
  products: {
    name: 'products',
    description: 'Items catalog and prices',
    columns: [
      { name: 'id', type: 'NUMBER', isPrimary: true },
      { name: 'product_name', type: 'STRING' },
      { name: 'price', type: 'NUMBER' },
      { name: 'category', type: 'STRING' },
      { name: 'stock', type: 'NUMBER' }
    ],
    rows: [
      { id: 501, product_name: 'Holographic Monitor', price: 599.99, category: 'Electronics', stock: 25 },
      { id: 502, product_name: 'Quantum Storage Drive', price: 189.50, category: 'Storage', stock: 120 },
      { id: 503, product_name: 'Anti-Gravity Mouse', price: 79.99, category: 'Peripherals', stock: 45 },
      { id: 504, product_name: 'Cybernetic Keyboard', price: 249.99, category: 'Peripherals', stock: 15 },
      { id: 505, product_name: 'Neural Interface Headset', price: 999.00, category: 'Electronics', stock: 8 },
      { id: 506, product_name: 'LED Nanotech Desk Lamp', price: 49.99, category: 'Furniture', stock: 60 }
    ]
  },
  orders: {
    name: 'orders',
    description: 'Customer transactions database',
    columns: [
      { name: 'id', type: 'NUMBER', isPrimary: true },
      { name: 'customer_id', type: 'NUMBER', isForeign: true, references: 'customers.id' },
      { name: 'product_id', type: 'NUMBER', isForeign: true, references: 'products.id' },
      { name: 'order_date', type: 'STRING' },
      { name: 'quantity', type: 'NUMBER' }
    ],
    rows: [
      { id: 1001, customer_id: 101, product_id: 503, order_date: '2025-05-10', quantity: 2 },
      { id: 1002, customer_id: 102, product_id: 501, order_date: '2025-05-11', quantity: 1 },
      { id: 1003, customer_id: 104, product_id: 504, order_date: '2025-05-12', quantity: 1 },
      { id: 1004, customer_id: 103, product_id: 502, order_date: '2025-05-12', quantity: 5 },
      { id: 1005, customer_id: 101, product_id: 502, order_date: '2025-05-14', quantity: 1 },
      { id: 1006, customer_id: 106, product_id: 505, order_date: '2025-05-15', quantity: 1 },
      { id: 1007, customer_id: 107, product_id: 506, order_date: '2025-05-16', quantity: 3 },
      { id: 1008, customer_id: 105, product_id: 503, order_date: '2025-05-16', quantity: 1 }
    ]
  },
  students: {
    name: 'students',
    description: 'Academic student profiles',
    columns: [
      { name: 'id', type: 'NUMBER', isPrimary: true },
      { name: 'name', type: 'STRING' },
      { name: 'age', type: 'NUMBER' },
      { name: 'major', type: 'STRING' },
      { name: 'gpa', type: 'NUMBER' }
    ],
    rows: [
      { id: 201, name: 'Alice Vance', age: 20, major: 'Computer Science', gpa: 3.85 },
      { id: 202, name: 'Bobby Axelrod', age: 22, major: 'Economics', gpa: 3.92 },
      { id: 203, name: 'Clara Oswald', age: 21, major: 'History', gpa: 3.40 },
      { id: 204, name: 'Danny Phantom', age: 19, major: 'Astrophysics', gpa: 2.75 },
      { id: 205, name: 'Elle Woods', age: 22, major: 'Pre-Law', gpa: 4.00 }
    ]
  },
  courses: {
    name: 'courses',
    description: 'Offered curriculum details',
    columns: [
      { name: 'id', type: 'NUMBER', isPrimary: true },
      { name: 'title', type: 'STRING' },
      { name: 'instructor', type: 'STRING' },
      { name: 'credits', type: 'NUMBER' },
      { name: 'department_id', type: 'NUMBER' }
    ],
    rows: [
      { id: 301, title: 'Intro to Quantum Computing', instructor: 'Dr. Feynman', credits: 4, department_id: 1 },
      { id: 302, title: 'Game Theory & Strategy', instructor: 'Prof. Nash', credits: 3, department_id: 2 },
      { id: 303, title: 'Ancient Civilizations', instructor: 'Dr. Jones', credits: 3, department_id: 3 },
      { id: 304, title: 'Rocket Propulsion', instructor: 'Prof. Goddard', credits: 4, department_id: 1 }
    ]
  },
  enrollments: {
    name: 'enrollments',
    description: 'Student course registrations and grades',
    columns: [
      { name: 'id', type: 'NUMBER', isPrimary: true },
      { name: 'student_id', type: 'NUMBER', isForeign: true, references: 'students.id' },
      { name: 'course_id', type: 'NUMBER', isForeign: true, references: 'courses.id' },
      { name: 'grade', type: 'STRING' },
      { name: 'enrollment_date', type: 'STRING' }
    ],
    rows: [
      { id: 4001, student_id: 201, course_id: 301, grade: 'A', enrollment_date: '2025-01-10' },
      { id: 4002, student_id: 201, course_id: 302, grade: 'B+', enrollment_date: '2025-01-12' },
      { id: 4003, student_id: 202, course_id: 302, grade: 'A', enrollment_date: '2025-01-09' },
      { id: 4004, student_id: 203, course_id: 303, grade: 'A-', enrollment_date: '2025-01-11' },
      { id: 4005, student_id: 204, course_id: 304, grade: 'C', enrollment_date: '2025-01-15' },
      { id: 4006, student_id: 205, course_id: 302, grade: 'A', enrollment_date: '2025-01-08' }
    ]
  },
  movies: {
    name: 'movies',
    description: 'Cinema productions directory',
    columns: [
      { name: 'id', type: 'NUMBER', isPrimary: true },
      { name: 'title', type: 'STRING' },
      { name: 'genre', type: 'STRING' },
      { name: 'release_year', type: 'NUMBER' },
      { name: 'rating', type: 'NUMBER' }
    ],
    rows: [
      { id: 601, title: 'Inception', genre: 'Sci-Fi', release_year: 2010, rating: 8.8 },
      { id: 602, title: 'The Dark Knight', genre: 'Action', release_year: 2008, rating: 9.0 },
      { id: 603, title: 'Pulp Fiction', genre: 'Crime', release_year: 1994, rating: 8.9 },
      { id: 604, title: 'Interstellar', genre: 'Sci-Fi', release_year: 2014, rating: 8.6 },
      { id: 605, title: 'Spirited Away', genre: 'Animation', release_year: 2001, rating: 8.6 }
    ]
  },
  actors: {
    name: 'actors',
    description: 'Film industry cast members',
    columns: [
      { name: 'id', type: 'NUMBER', isPrimary: true },
      { name: 'name', type: 'STRING' },
      { name: 'birth_year', type: 'NUMBER' },
      { name: 'nationality', type: 'STRING' }
    ],
    rows: [
      { id: 701, name: 'Leonardo DiCaprio', birth_year: 1974, nationality: 'USA' },
      { id: 702, name: 'Christian Bale', birth_year: 1974, nationality: 'UK' },
      { id: 703, name: 'John Travolta', birth_year: 1954, nationality: 'USA' },
      { id: 704, name: 'Matthew McConaughey', birth_year: 1969, nationality: 'USA' }
    ]
  },
  roles: {
    name: 'roles',
    description: 'Cast roles in film productions',
    columns: [
      { name: 'movie_id', type: 'NUMBER', isPrimary: true, isForeign: true, references: 'movies.id' },
      { name: 'actor_id', type: 'NUMBER', isPrimary: true, isForeign: true, references: 'actors.id' },
      { name: 'character_name', type: 'STRING' },
      { name: 'salary', type: 'NUMBER' }
    ],
    rows: [
      { movie_id: 601, actor_id: 701, character_name: 'Cobb', salary: 20000000 },
      { movie_id: 602, actor_id: 702, character_name: 'Bruce Wayne', salary: 15000000 },
      { movie_id: 603, actor_id: 703, character_name: 'Vincent Vega', salary: 150000 },
      { movie_id: 604, actor_id: 704, character_name: 'Cooper', salary: 18000000 }
    ]
  },
  books: {
    name: 'books',
    description: 'Literary publications',
    columns: [
      { name: 'id', type: 'NUMBER', isPrimary: true },
      { name: 'title', type: 'STRING' },
      { name: 'author_id', type: 'NUMBER', isForeign: true, references: 'authors.id' },
      { name: 'genre', type: 'STRING' },
      { name: 'price', type: 'NUMBER' },
      { name: 'publish_year', type: 'NUMBER' }
    ],
    rows: [
      { id: 801, title: 'The Hobbit', author_id: 901, genre: 'Fantasy', price: 14.99, publish_year: 1937 },
      { id: 802, title: '1984', author_id: 902, genre: 'Dystopian', price: 9.99, publish_year: 1949 },
      { id: 803, title: 'Animal Farm', author_id: 902, genre: 'Dystopian', price: 7.99, publish_year: 1945 },
      { id: 804, title: 'Harry Potter and the Sorcerer\'s Stone', author_id: 903, genre: 'Fantasy', price: 24.99, publish_year: 1997 },
      { id: 805, title: 'Murder on the Orient Express', author_id: 904, genre: 'Mystery', price: 12.50, publish_year: 1934 }
    ]
  },
  authors: {
    name: 'authors',
    description: 'Book authors bio catalog',
    columns: [
      { name: 'id', type: 'NUMBER', isPrimary: true },
      { name: 'name', type: 'STRING' },
      { name: 'country', type: 'STRING' },
      { name: 'rating', type: 'NUMBER' }
    ],
    rows: [
      { id: 901, name: 'J.R.R. Tolkien', country: 'UK', rating: 4.9 },
      { id: 902, name: 'George Orwell', country: 'UK', rating: 4.8 },
      { id: 903, name: 'J.K. Rowling', country: 'UK', rating: 4.7 },
      { id: 904, name: 'Agatha Christie', country: 'UK', rating: 4.6 }
    ]
  },
  reviews: {
    name: 'reviews',
    description: 'Customer book reviews',
    columns: [
      { name: 'id', type: 'NUMBER', isPrimary: true },
      { name: 'book_id', type: 'NUMBER', isForeign: true, references: 'books.id' },
      { name: 'customer_id', type: 'NUMBER' },
      { name: 'rating', type: 'NUMBER' },
      { name: 'review_date', type: 'STRING' }
    ],
    rows: [
      { id: 851, book_id: 801, customer_id: 101, rating: 5, review_date: '2025-04-10' },
      { id: 852, book_id: 802, customer_id: 101, rating: 4, review_date: '2025-04-12' },
      { id: 853, book_id: 801, customer_id: 102, rating: 5, review_date: '2025-04-15' },
      { id: 854, book_id: 804, customer_id: 103, rating: 5, review_date: '2025-04-16' },
      { id: 855, book_id: 805, customer_id: 104, rating: 3, review_date: '2025-04-20' }
    ]
  },
  sales: {
    name: 'sales',
    description: 'Regional corporate sales reports',
    columns: [
      { name: 'id', type: 'NUMBER', isPrimary: true },
      { name: 'region', type: 'STRING' },
      { name: 'product_id', type: 'NUMBER' },
      { name: 'amount', type: 'NUMBER' },
      { name: 'sale_date', type: 'STRING' }
    ],
    rows: [
      { id: 1101, region: 'North America', product_id: 501, amount: 12000, sale_date: '2025-05-01' },
      { id: 1102, region: 'Europe', product_id: 501, amount: 8500, sale_date: '2025-05-02' },
      { id: 1103, region: 'Asia-Pacific', product_id: 502, amount: 24000, sale_date: '2025-05-02' },
      { id: 1104, region: 'North America', product_id: 503, amount: 9500, sale_date: '2025-05-03' },
      { id: 1105, region: 'Latin America', product_id: 504, amount: 4800, sale_date: '2025-05-04' },
      { id: 1106, region: 'Europe', product_id: 502, amount: 16500, sale_date: '2025-05-05' }
    ]
  },
  inventory: {
    name: 'inventory',
    description: 'Product stocks per warehouse',
    columns: [
      { name: 'product_id', type: 'NUMBER', isPrimary: true, isForeign: true, references: 'products.id' },
      { name: 'warehouse_id', type: 'NUMBER', isPrimary: true, isForeign: true, references: 'warehouses.id' },
      { name: 'quantity_on_hand', type: 'NUMBER' },
      { name: 'last_updated', type: 'STRING' }
    ],
    rows: [
      { product_id: 501, warehouse_id: 1, quantity_on_hand: 10, last_updated: '2025-06-01' },
      { product_id: 501, warehouse_id: 2, quantity_on_hand: 15, last_updated: '2025-06-02' },
      { product_id: 502, warehouse_id: 1, quantity_on_hand: 80, last_updated: '2025-06-01' },
      { product_id: 502, warehouse_id: 2, quantity_on_hand: 40, last_updated: '2025-06-03' },
      { product_id: 503, warehouse_id: 1, quantity_on_hand: 45, last_updated: '2025-05-28' },
      { product_id: 505, warehouse_id: 2, quantity_on_hand: 8, last_updated: '2025-06-04' }
    ]
  },
  warehouses: {
    name: 'warehouses',
    description: 'Physical storage locations',
    columns: [
      { name: 'id', type: 'NUMBER', isPrimary: true },
      { name: 'location', type: 'STRING' },
      { name: 'capacity', type: 'NUMBER' }
    ],
    rows: [
      { id: 1, location: 'Chicago, IL', capacity: 5000 },
      { id: 2, location: 'Frankfurt, DE', capacity: 8000 },
      { id: 3, location: 'Tokyo, JP', capacity: 10000 }
    ]
  },
  suppliers: {
    name: 'suppliers',
    description: 'Hardware part suppliers logistics',
    columns: [
      { name: 'id', type: 'NUMBER', isPrimary: true },
      { name: 'supplier_name', type: 'STRING' },
      { name: 'contact_email', type: 'STRING' },
      { name: 'country', type: 'STRING' }
    ],
    rows: [
      { id: 10, supplier_name: 'Apex Chips Corp', contact_email: 'sales@apexchips.com', country: 'Taiwan' },
      { id: 20, supplier_name: 'Nexus Assemblies', contact_email: 'info@nexusassemblies.de', country: 'Germany' },
      { id: 30, supplier_name: 'CyberPower Plastics', contact_email: 'parts@cyberpower.cn', country: 'China' }
    ]
  },
  accounts: {
    name: 'accounts',
    description: 'Banking customer accounts ledger',
    columns: [
      { name: 'id', type: 'NUMBER', isPrimary: true },
      { name: 'customer_id', type: 'NUMBER', isForeign: true, references: 'customers.id' },
      { name: 'balance', type: 'NUMBER' },
      { name: 'account_type', type: 'STRING' }
    ],
    rows: [
      { id: 9001, customer_id: 101, balance: 1250.50, account_type: 'Checking' },
      { id: 9002, customer_id: 101, balance: 10450.00, account_type: 'Savings' },
      { id: 9003, customer_id: 102, balance: 350.25, account_type: 'Checking' },
      { id: 9004, customer_id: 103, balance: 1420500.00, account_type: 'Savings' },
      { id: 9005, customer_id: 104, balance: 50.00, account_type: 'Checking' },
      { id: 9006, customer_id: 104, balance: 4200.00, account_type: 'Savings' }
    ]
  },
  transactions: {
    name: 'transactions',
    description: 'Ledger account audit transactions',
    columns: [
      { name: 'id', type: 'NUMBER', isPrimary: true },
      { name: 'account_id', type: 'NUMBER', isForeign: true, references: 'accounts.id' },
      { name: 'type', type: 'STRING' },
      { name: 'amount', type: 'NUMBER' },
      { name: 'timestamp', type: 'STRING' }
    ],
    rows: [
      { id: 55001, account_id: 9001, type: 'Deposit', amount: 500.00, timestamp: '2025-06-10 10:14:00' },
      { id: 55002, account_id: 9001, type: 'Withdrawal', amount: 80.00, timestamp: '2025-06-11 15:32:00' },
      { id: 55003, account_id: 9003, type: 'Deposit', amount: 1500.00, timestamp: '2025-06-12 09:44:00' },
      { id: 55004, account_id: 9004, type: 'Deposit', amount: 50000.00, timestamp: '2025-06-14 18:22:00' },
      { id: 55005, account_id: 9006, type: 'Withdrawal', amount: 200.00, timestamp: '2025-06-15 11:05:00' }
    ]
  }
};

/**
 * Generates an instanced large performance dataset with the specified number of rows.
 * Designed to stress-test 3D visualizers, testing rendering up to 10,000+ entries.
 */
export function generatePerformanceDataset(count: number): TableData {
  const firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore'];
  const roles = ['Software Engineer', 'QA Tester', 'Product Owner', 'DevOps Specialist', 'Business Analyst', 'Security Specialist', 'HR Partner', 'Marketing Coordinator'];
  
  const rows: Record<string, any>[] = [];
  for (let i = 1; i <= count; i++) {
    const fName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const role = roles[Math.floor(Math.random() * roles.length)];
    const salary = Math.floor(Math.random() * 80000) + 40000;
    const age = Math.floor(Math.random() * 45) + 20;
    const department_id = Math.floor(Math.random() * 5) + 1; // references departments
    
    rows.push({
      id: i,
      name: `${fName} ${lName}`,
      age,
      salary,
      department_id,
      role
    });
  }
  
  return {
    name: 'performance_employees',
    description: `Synthesized large-scale performance testing database (${count} rows)`,
    columns: [
      { name: 'id', type: 'NUMBER', isPrimary: true },
      { name: 'name', type: 'STRING' },
      { name: 'age', type: 'NUMBER' },
      { name: 'salary', type: 'NUMBER' },
      { name: 'department_id', type: 'NUMBER', isForeign: true, references: 'departments.id' },
      { name: 'role', type: 'STRING' }
    ],
    rows
  };
}
