import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Image from "next/image";
import ProductForm from "@/components/ProductForm";
import DeleteProductButton from "@/components/DeleteProductButton";
import EditProductButton from "@/components/EditProductButton";

export default async function AdminProducts() {
  const session = await getServerSession(authOptions);

  if (!session?.user || (session.user as any).role !== "admin") {
    redirect("/");
  }

  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-coffee-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-light text-coffee-900 mb-8 tracking-tight">
          Manage Products
        </h1>

        {/* Add Product Form */}
        <div className="bg-white border border-coffee-200 p-6 mb-8">
          <h2 className="text-2xl font-light text-coffee-900 mb-6">
            Add New Product
          </h2>
          <ProductForm />
        </div>

        {/* Products List */}
        <div className="bg-white border border-coffee-200 p-6">
          <h2 className="text-2xl font-light text-coffee-900 mb-6">
            Current Products
          </h2>
          <div className="space-y-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="flex gap-4 items-start border-b border-coffee-100 pb-4 last:border-b-0"
              >
                <div className="relative w-20 h-20 bg-coffee-50 flex-shrink-0">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-coffee-900">
                    {product.name}
                  </h3>
                  <p className="text-coffee-600 text-sm mt-1">
                    {product.description}
                  </p>
                  <p className="text-coffee-900 font-medium mt-2">
                    ${product.price.toFixed(2)}
                  </p>
                  <p className="text-coffee-600 text-sm">
                    Category: {product.category} | Stock:{" "}
                    {product.inStock ? "In Stock" : "Out of Stock"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <EditProductButton product={product} />
                  <DeleteProductButton productId={product.id} />
                </div>
              </div>
            ))}
            {products.length === 0 && (
              <p className="text-coffee-600 text-center py-8">
                No products yet. Add your first product above!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
