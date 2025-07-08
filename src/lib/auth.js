import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        identifier: {
          label: "Email or Username",
          type: "text",
          placeholder: "Enter email or username",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.identifier || !credentials?.password) {
            throw new Error("Please provide both email/username and password");
          }

          const isEmail = credentials.identifier.includes("@");
          const payload = isEmail
            ? { email: credentials.identifier, password: credentials.password }
            : { username: credentials.identifier, password: credentials.password };

          // Choose endpoint based on identifier type
          const endpoint = isEmail
            ? "http://localhost:8080/api/users/login-email"
            : "http://localhost:8080/api/users/login";

          const response = await fetch(endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload), // Correct payload serialization
          });

          if (!response.ok) {
            throw new Error("Invalid credentials");
          }

          const user = await response.json();

          return {
            id: user.id.toString(),
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username || user.email.split("@")[0],
            email: user.email,
            role: user.role,
            buyerId: user.buyerId,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.username = token.username;
        session.user.email = token.email;
        session.user.firstName = token.firstName;
        session.user.lastName = token.lastName;
        session.user.buyerId = token.buyerId; // Ensure buyerId is included if needed

      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.username = user.username;
        token.email = user.email;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.buyerId = user.buyerId; 
      }
      return token;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 15, 
  },
  debug: process.env.NODE_ENV === "development",
};
