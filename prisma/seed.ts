import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create admin user
  const hashedPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@ellabean.com" },
    update: {},
    create: {
      email: "admin@ellabean.com",
      name: "Admin",
      password: hashedPassword,
      role: "admin",
    },
  });
  console.log("✓ Created admin user");

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
    const existing = await prisma.product.findFirst({
      where: { name: product.name },
    });
    if (!existing) {
      await prisma.product.create({
        data: product,
      });
    }
  }
  console.log("✓ Created sample products");

  // Create sample location
  const location = await prisma.location.upsert({
    where: { id: "sample-location" },
    update: {},
    create: {
      id: "sample-location",
      title: "Downtown Farmers Market",
      description: "Join us every Saturday morning for fresh coffee and pastries!",
      address: "123 Market Street, Downtown",
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
      active: true,
    },
  });
  console.log("✓ Created sample location");

  console.log("\n✨ Database seeded successfully!");
  console.log("\n📝 Admin credentials:");
  console.log("   Email: admin@ellabean.com");
  console.log("   Password: admin123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
