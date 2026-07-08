import { prisma } from "@/lib/db";
import { MessagesInbox, type MessageRow } from "@/components/admin/messages-inbox";

export const dynamic = "force-dynamic";

export default async function AdminMessagesPage() {
  const rows: MessageRow[] = prisma
    ? (
        await prisma.contactMessage.findMany({
          orderBy: { createdAt: "desc" },
          take: 200,
        })
      ).map((m) => ({
        id: m.id,
        name: m.name,
        email: m.email,
        subject: m.subject,
        message: m.message,
        readAt: m.readAt?.toISOString() ?? null,
        createdAt: m.createdAt.toISOString(),
      }))
    : [];

  return <MessagesInbox initial={rows} />;
}
