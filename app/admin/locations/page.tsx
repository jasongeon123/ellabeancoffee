import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import LocationForm from "@/components/LocationForm";
import DeleteLocationButton from "@/components/DeleteLocationButton";
import ToggleLocationButton from "@/components/ToggleLocationButton";
import EditLocationButton from "@/components/EditLocationButton";

export default async function AdminLocations() {
  const session = await getServerSession(authOptions);

  if (!session?.user || (session.user as any).role !== "admin") {
    redirect("/");
  }

  const locations = await prisma.location.findMany({
    orderBy: { date: "desc" },
  });

  return (
    <div className="min-h-screen bg-coffee-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-light text-coffee-900 mb-8 tracking-tight">
          Manage Locations
        </h1>

        {/* Add Location Form */}
        <div className="bg-white border border-coffee-200 p-6 mb-8">
          <h2 className="text-2xl font-light text-coffee-900 mb-6">
            Add New Location
          </h2>
          <LocationForm />
        </div>

        {/* Locations List */}
        <div className="bg-white border border-coffee-200 p-6">
          <h2 className="text-2xl font-light text-coffee-900 mb-6">
            Current Locations
          </h2>
          <div className="space-y-4">
            {locations.map((location) => (
              <div
                key={location.id}
                className="border-b border-coffee-100 pb-4 last:border-b-0"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-medium text-coffee-900">
                    {location.title}
                    {location.active && (
                      <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        Active
                      </span>
                    )}
                  </h3>
                  <div className="flex gap-2">
                    <EditLocationButton location={location} />
                    <ToggleLocationButton
                      locationId={location.id}
                      currentStatus={location.active}
                    />
                    <DeleteLocationButton locationId={location.id} />
                  </div>
                </div>
                <p className="text-coffee-700 mb-2">{location.description}</p>
                <p className="text-coffee-600 text-sm">
                  <span className="font-medium">Address:</span> {location.address}
                </p>
                <p className="text-coffee-600 text-sm">
                  <span className="font-medium">Date:</span>{" "}
                  {new Date(location.date).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            ))}
            {locations.length === 0 && (
              <p className="text-coffee-600 text-center py-8">
                No locations yet. Add your first location above!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
