import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import MarkContactReadButton from "@/components/MarkContactReadButton";

export default async function AdminContactsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || (session.user as any).role !== "admin") {
    redirect("/");
  }

  const contacts = await prisma.contactSubmission.findMany({
    orderBy: { createdAt: "desc" },
  });

  const unreadCount = contacts.filter((c) => !c.read).length;

  return (
    <div className="min-h-screen bg-coffee-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-light text-coffee-900 tracking-tight">
              Contact Submissions
            </h1>
            <p className="text-coffee-600 mt-2">
              {unreadCount > 0 && (
                <span className="inline-block bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {unreadCount} unread
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="bg-white border border-coffee-200 rounded-lg overflow-hidden">
          {contacts.length === 0 ? (
            <div className="p-12 text-center text-coffee-600">
              No contact submissions yet.
            </div>
          ) : (
            <div className="divide-y divide-coffee-100">
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  className={`p-6 ${
                    !contact.read ? "bg-blue-50" : "bg-white"
                  } hover:bg-coffee-50 transition-colors`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-medium text-coffee-900">
                          {contact.name}
                        </h3>
                        {!contact.read && (
                          <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                        )}
                      </div>
                      <p className="text-coffee-600 text-sm mb-1">
                        <a
                          href={`mailto:${contact.email}`}
                          className="hover:underline"
                        >
                          {contact.email}
                        </a>
                      </p>
                      {contact.subject && (
                        <p className="text-coffee-900 font-medium mb-2">
                          Subject: {contact.subject}
                        </p>
                      )}
                      <p className="text-coffee-600 text-sm">
                        {new Date(contact.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </p>
                    </div>
                    <MarkContactReadButton
                      contactId={contact.id}
                      isRead={contact.read}
                    />
                  </div>
                  <div className="bg-white border border-coffee-200 rounded p-4">
                    <p className="text-coffee-800 whitespace-pre-wrap">
                      {contact.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
