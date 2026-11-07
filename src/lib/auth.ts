import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import { revalidatePath } from "next/cache";
import { Role } from "@prisma/client";
import prisma from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    error: "/auth/error",
  },
  callbacks: {
    async signIn({ profile, user }) {
      if (!profile?.email) {
        throw new Error("No profile email found");
      }

      if (user && user.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
        });

        if (dbUser) {
          const assignedRole: Role = dbUser.role;
          await prisma.user.update({
            where: { id: user.id },
            data: { role: assignedRole },
          });
        }
      }

      revalidatePath("/dashboard/");

      return true;
    },
    async jwt({ token, user, profile }) {
      // preserve existing id/role
      if (user) {
        token.id = user.id;
      }
      if (profile) {
        (token as any).name = (profile as any).name ?? (token as any).name;
        (token as any).email = (profile as any).email ?? (token as any).email;
        (token as any).picture =
          (profile as any).picture ?? (token as any).picture;
      }

      if (token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true },
        });
        token.role = dbUser?.role;

        // ADMIN_EMAILS (opsional, dipisah koma): email yang otomatis dijadikan
        // admin saat login. Dipakai di project preview agar tidak perlu
        // mengubah role langsung di database.
        const email = ((token as any).email as string | undefined)?.toLowerCase();
        const adminEmails = (process.env.ADMIN_EMAILS ?? "")
          .split(",")
          .map((e) => e.trim().toLowerCase())
          .filter(Boolean);
        if (dbUser && email && adminEmails.includes(email) && dbUser.role !== Role.admin) {
          await prisma.user.update({
            where: { id: token.id as string },
            data: { role: Role.admin },
          });
          token.role = Role.admin;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        session.user.name = (token as any).name ?? session.user.name;
        session.user.email = (token as any).email ?? session.user.email;
        session.user.image = (token as any).picture ?? session.user.image;
      }

      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
