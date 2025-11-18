import { Pool } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  console.log("Seeding database...");

  try {
    // Create admin user
    const hashedPassword = await bcrypt.hash("admin123", 10);

    // Check if admin exists
    const existingAdmin = await pool.query(
      'SELECT * FROM "User" WHERE email = $1 LIMIT 1',
      ["admin@ellabean.com"]
    );

    if (existingAdmin.rows.length === 0) {
      await pool.query(
        `INSERT INTO "User" (id, email, name, password, role, "createdAt", "updatedAt")
         VALUES (gen_random_uuid()::text, $1, $2, $3, $4, NOW(), NOW())`,
        ["admin@ellabean.com", "Admin", hashedPassword, "admin"]
      );
      console.log("✓ Created admin user");
    } else {
      console.log("✓ Admin user already exists");
    }

    // Create sample products
    const products = [
      {
        name: "House Blend",
        description: "Our signature medium roast coffee with notes of chocolate and caramel. Perfect for everyday brewing.",
        price: 16.99,
        category: "Coffee Beans",
        image: "/1.jpg",
        inStock: true,
      },
      {
        name: "Single Origin Ethiopia",
        description: "Light roast with bright floral and citrus notes. Sourced from the birthplace of coffee.",
        price: 19.99,
        category: "Coffee Beans",
        image: "/2.jpg",
        inStock: true,
      },
      {
        name: "Dark Roast Espresso",
        description: "Bold and rich espresso blend. Perfect for lattes and cappuccinos.",
        price: 18.99,
        category: "Espresso",
        image: "/3.jpg",
        inStock: true,
      },
      {
        name: "Cold Brew Blend",
        description: "Specially crafted for cold brewing. Smooth, sweet, and refreshing.",
        price: 17.99,
        category: "Cold Brew",
        image: "/4.jpg",
        inStock: true,
      },
      {
        name: "Decaf Colombian",
        description: "All the flavor, none of the caffeine. Swiss water processed for purity.",
        price: 16.99,
        category: "Coffee Beans",
        image: "/5.jpg",
        inStock: true,
      },
      {
        name: "Seasonal Blend",
        description: "Our rotating seasonal selection. Currently featuring a smooth medium roast.",
        price: 20.99,
        category: "Coffee Beans",
        image: "/6.jpg",
        inStock: true,
      },
    ];

    for (const product of products) {
      const existing = await pool.query(
        'SELECT * FROM "Product" WHERE name = $1 LIMIT 1',
        [product.name]
      );

      if (existing.rows.length === 0) {
        await pool.query(
          `INSERT INTO "Product" (id, name, description, price, category, image, "inStock", "createdAt", "updatedAt")
           VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, NOW(), NOW())`,
          [product.name, product.description, product.price, product.category, product.image, product.inStock]
        );
      }
    }
    console.log("✓ Created sample products");

    // Create sample location
    const existingLocation = await pool.query(
      'SELECT * FROM "Location" WHERE id = $1 LIMIT 1',
      ["sample-location"]
    );

    const locationDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 1 week from now

    if (existingLocation.rows.length === 0) {
      await pool.query(
        `INSERT INTO "Location" (id, title, description, address, date, active, "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
        [
          "sample-location",
          "Downtown Farmers Market",
          "Join us every Saturday morning for fresh coffee and pastries!",
          "123 Market Street, Downtown",
          locationDate,
          true
        ]
      );
      console.log("✓ Created sample location");
    } else {
      console.log("✓ Sample location already exists");
    }

    console.log("\n✨ Database seeded successfully!");
    console.log("\n📝 Admin credentials:");
    console.log("   Email: admin@ellabean.com");
    console.log("   Password: admin123");
  } finally {
    await pool.end();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
