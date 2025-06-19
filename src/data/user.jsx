export const users = [
  {
    id: 1,
    buyerId: 1,
    username: "admin",
    email: "admin@realestate.com",
    password: "admin123", // In production, use hashed passwords
    role: "admin",
    firstName: "Admin",
    lastName: "User",
    phone: "+1-555-0100",
    createdAt: new Date("2024-01-01"),
  },
  {
    id: 2,
    buyerId: 2,
    username: "johndoe",
    email: "john@example.com",
    password: "user123", // In production, use hashed passwords
    role: "user",
    firstName: "John",
    lastName: "Doe",
    phone: "+1-555-0101",
    createdAt: new Date("2024-01-15"),
  },
  {
    id: 3,
    buyerId: 3,
    username: "janedoe",
    email: "michael.brown@email.com",
    password: "user123", // In production, use hashed passwords
    role: "user",
    firstName: "Jane",
    lastName: "Doe",
    phone: "+1-555-0102",
    createdAt: new Date("2024-01-20"),
  },
];
