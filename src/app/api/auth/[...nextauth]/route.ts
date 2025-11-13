import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authenticateUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const authOptions = {
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await authenticateUser(
          credentials.email,
          credentials.password
        );

        if (!user) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name
        };
      }
    })
  ],

  pages: {
    signIn: "/auth/signin"
  },

  session: { strategy: "jwt" },

  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      return session;
    }
  }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
