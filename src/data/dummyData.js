export const departments = [
  "Account",
  "Sales",
  "Purchase",
  "Production",
  "Dispatch",
];

export const roles = [
  "Admin",
  "Manager",
  "Employee",
];

export const dummyStaff = [
  // =========================
  // ADMINS
  // =========================

  {
    id: 1,
    name: "Arjun Mehta",
    email: "arjun@company.com",
    dob: "1990-04-12",
    phone: "+91 98765 43210",
    alternatePhone: "+91 98765 43211",
    address: "Rajkot, Gujarat",
    aadhaar: "XXXX-XXXX-1234",
    role: "Admin",
    department: null,
    managerId: null,
    status: "Active",
  },

  {
    id: 2,
    name: "Rahul Shah",
    email: "rahul@company.com",
    dob: "1988-08-21",
    phone: "+91 98765 12345",
    alternatePhone: "+91 98765 12346",
    address: "Rajkot, Gujarat",
    aadhaar: "XXXX-XXXX-5678",
    role: "Admin",
    department: null,
    managerId: null,
    status: "Active",
  },

  // =========================
  // ACCOUNT
  // =========================

  {
    id: 3,
    name: "Karan Patel",
    email: "karan@company.com",
    dob: "1992-03-15",
    phone: "+91 98765 67890",
    alternatePhone: "+91 98765 67891",
    address: "Rajkot, Gujarat",
    aadhaar: "XXXX-XXXX-2345",
    role: "Manager",
    department: "Account",
    managerId: null,
    status: "Active",
  },

  {
    id: 4,
    name: "Jay Patel",
    email: "jay@company.com",
    dob: "1998-06-10",
    phone: "+91 98765 22222",
    alternatePhone: "+91 98765 22223",
    address: "Rajkot, Gujarat",
    aadhaar: "XXXX-XXXX-3456",
    role: "Employee",
    department: "Account",
    managerId: 3,
    status: "Active",
  },

  // =========================
  // SALES
  // =========================

  {
    id: 5,
    name: "Ravi Joshi",
    email: "ravi@company.com",
    dob: "1991-11-02",
    phone: "+91 98765 11111",
    alternatePhone: "+91 98765 11112",
    address: "Rajkot, Gujarat",
    aadhaar: "XXXX-XXXX-4567",
    role: "Manager",
    department: "Sales",
    managerId: null,
    status: "Active",
  },

  {
    id: 6,
    name: "Dev Shah",
    email: "dev@company.com",
    dob: "1999-02-18",
    phone: "+91 98765 33333",
    alternatePhone: "+91 98765 33334",
    address: "Rajkot, Gujarat",
    aadhaar: "XXXX-XXXX-5678",
    role: "Employee",
    department: "Sales",
    managerId: 5,
    status: "Active",
  },

  {
    id: 7,
    name: "Vishal Patel",
    email: "vishal@company.com",
    dob: "2000-09-25",
    phone: "+91 98765 44444",
    alternatePhone: "+91 98765 44445",
    address: "Rajkot, Gujarat",
    aadhaar: "XXXX-XXXX-6789",
    role: "Employee",
    department: "Sales",
    managerId: 5,
    status: "Active",
  },

  // =========================
  // PURCHASE
  // =========================

  {
    id: 8,
    name: "Manish Shah",
    email: "manish@company.com",
    dob: "1989-12-05",
    phone: "+91 98765 55555",
    alternatePhone: "+91 98765 55556",
    address: "Rajkot, Gujarat",
    aadhaar: "XXXX-XXXX-7890",
    role: "Manager",
    department: "Purchase",
    managerId: null,
    status: "Active",
  },

  {
    id: 9,
    name: "Nikhil Patel",
    email: "nikhil@company.com",
    dob: "1997-07-19",
    phone: "+91 98765 66666",
    alternatePhone: "+91 98765 66667",
    address: "Rajkot, Gujarat",
    aadhaar: "XXXX-XXXX-8901",
    role: "Employee",
    department: "Purchase",
    managerId: 8,
    status: "Active",
  },

  // =========================
  // PRODUCTION
  // =========================

  {
    id: 10,
    name: "Harsh Mehta",
    email: "harsh@company.com",
    dob: "1990-01-28",
    phone: "+91 98765 77777",
    alternatePhone: "+91 98765 77778",
    address: "Rajkot, Gujarat",
    aadhaar: "XXXX-XXXX-9012",
    role: "Manager",
    department: "Production",
    managerId: null,
    status: "Active",
  },

  {
    id: 11,
    name: "Dhruv Shah",
    email: "dhruv@company.com",
    dob: "1998-05-14",
    phone: "+91 98765 88888",
    alternatePhone: "+91 98765 88889",
    address: "Rajkot, Gujarat",
    aadhaar: "XXXX-XXXX-0123",
    role: "Employee",
    department: "Production",
    managerId: 10,
    status: "Active",
  },

  // =========================
  // DISPATCH
  // =========================

  {
    id: 12,
    name: "Amit Joshi",
    email: "amit@company.com",
    dob: "1991-10-08",
    phone: "+91 98765 99999",
    alternatePhone: "+91 98765 99998",
    address: "Rajkot, Gujarat",
    aadhaar: "XXXX-XXXX-1234",
    role: "Manager",
    department: "Dispatch",
    managerId: null,
    status: "Active",
  },

  {
    id: 13,
    name: "Yash Patel",
    email: "yash@company.com",
    dob: "1999-03-22",
    phone: "+91 98765 10101",
    alternatePhone: "+91 98765 10102",
    address: "Rajkot, Gujarat",
    aadhaar: "XXXX-XXXX-2345",
    role: "Employee",
    department: "Dispatch",
    managerId: 12,
    status: "Active",
  },
];

export const modules = [
  "Dashboard",
  "Payment",
  "LR",
  "Ledger",
  "Product",
  "Sale Bill",
  "WhatsApp AI",
  "Inventory",
  "Purchase",
  "Production",
  "Dispatch",
  "Reports",
];

export const dashboardStats = {
  totalStaff: 13,
  totalAdmins: 2,
  totalManagers: 5,
  totalEmployees: 6,
};