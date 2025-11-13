import CredentialsProvider from "next-auth/providers/credentials";
import { authenticateUser } from "@/lib/auth";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",

      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },

      async authorize(credentials: any) {
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
      if (user) {
        token.id = user.id;
      }
      return token;
    },

    async session({ session, token }) {
      session.user.id = token.id;
      return session;
    }
  }
};
