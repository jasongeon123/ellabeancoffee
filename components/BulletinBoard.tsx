import { Pool } from '@neondatabase/serverless';

export default async function BulletinBoard() {
  let locations: any[] = [];

  try {
    // Skip database query if DATABASE_URL is not available (e.g., in CI)
    if (process.env.DATABASE_URL) {
      const pool = new Pool({ connectionString: process.env.DATABASE_URL });
      const result = await pool.query(
        'SELECT * FROM "Location" WHERE active = true ORDER BY date ASC LIMIT 3'
      );
      locations = result.rows;
      pool.end();
    }
  } catch (error) {
    console.warn('Failed to fetch locations for bulletin board:', error);
  }

  if (locations.length === 0) {
    return null;
  }

  const gridCols = locations.length === 1
    ? "grid-cols-1 max-w-md mx-auto"
    : locations.length === 2
    ? "grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto"
    : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";

  const getGoogleMapsUrl = (address: string) => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  };

  return (
    <div className={`grid ${gridCols} gap-6`}>
      {locations.map((location, index) => (
        <div
          key={location.id}
          className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden group border border-coffee-100 hover:border-coffee-300"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="bg-gradient-to-br from-coffee-800 to-coffee-900 p-6 group-hover:from-coffee-700 group-hover:to-coffee-800 transition-all duration-500">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <span className="text-white/80 text-xs uppercase tracking-wider">Event</span>
            </div>
            <h4 className="text-2xl font-light text-white mb-2 tracking-tight">
              {location.title}
            </h4>
          </div>
          <div className="p-6">
            <p className="text-coffee-700 mb-6 leading-relaxed font-light">
              {location.description}
            </p>
            <div className="space-y-3">
              <a
                href={getGoogleMapsUrl(location.address)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 group hover:bg-coffee-50 -mx-2 px-2 py-2 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-coffee-600 mt-0.5 flex-shrink-0 group-hover:text-coffee-900 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div className="flex-1">
                  <div className="text-xs text-coffee-500 uppercase tracking-wider mb-1">Location</div>
                  <div className="text-coffee-900 font-light group-hover:text-coffee-700 group-hover:underline transition-colors">{location.address}</div>
                  <div className="text-xs text-coffee-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    Click for directions →
                  </div>
                </div>
              </a>
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-coffee-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div>
                  <div className="text-xs text-coffee-500 uppercase tracking-wider mb-1">Date</div>
                  <div className="text-coffee-900 font-light">
                    {new Date(location.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
