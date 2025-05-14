export const SERVER_URL = 'http://localhost:5000';

// This can be replaced with an API call to fetch users from database
export const fetchUsersFromDatabase = async () => {
  // Example: Replace this with your actual API call
  // const response = await fetch(`${SERVER_URL}/api/users`);
  // return await response.json();
  
  // For now, return static users
  return USERS;
};

export const USERS = [
  {
    id: "a07b2a2e-2c18-4e3b-91f7-57e2f2a69b5f",
    name: "Majid",
    email: "majid@aibsol.com",
    phone: "+1234567890",
  },
  {
    id: "b08b2b2e-4d29-5f4b-81f7-57e2f2b79c6f",
    name: "Cynosureksa",
    email: "cynosureksa@gmail.com",
    phone: "+1234567891",
  },
  {
    id: "c9d53f1e-3a75-4e82-8437-4f0c1457c739",
    name: "John Doe",
    email: "john@example.com",
    phone: "+1234567892",
  },
  {
    id: "e79868f2-d7b5-4ab8-9632-b6d54a13f31b",
    name: "Alice Smith",
    email: "alice.smith@example.com",
    phone: "+1234567893",
  },
  {
    id: "f0f2dfde-3c24-4d7b-bbfd-8e317ec76cf5",
    name: "Bob Johnson",
    email: "bob.johnson@example.com",
    phone: "+1234567894",
  },
  {
    id: "d9136d2e-b0f7-4d13-b154-d3f3b2b8ed08",
    name: "Eve Adams",
    email: "eve.adams@example.com",
    phone: "+1234567895",
  },
  {
    id: "28d664e4-c3d2-48bc-b456-19014b9d66d1",
    name: "Charlie Brown",
    email: "charlie.brown@example.com",
    phone: "+1234567896",
  }
];
