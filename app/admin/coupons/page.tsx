import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import CouponForm from "@/components/CouponForm";
import DeleteCouponButton from "@/components/DeleteCouponButton";
import ToggleCouponActiveButton from "@/components/ToggleCouponActiveButton";

export default async function AdminCouponsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || (session.user as any).role !== "admin") {
    redirect("/");
  }

  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-coffee-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-light text-coffee-900 mb-8 tracking-tight">
          Manage Coupons
        </h1>

        {/* Add Coupon Form */}
        <div className="bg-white border border-coffee-200 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-light text-coffee-900 mb-6">
            Create New Coupon
          </h2>
          <CouponForm />
        </div>

        {/* Coupons List */}
        <div className="bg-white border border-coffee-200 rounded-lg overflow-hidden">
          <div className="p-6 border-b border-coffee-100">
            <h2 className="text-2xl font-light text-coffee-900">
              Active Coupons
            </h2>
          </div>
          {coupons.length === 0 ? (
            <div className="p-12 text-center text-coffee-600">
              No coupons yet. Create your first coupon above!
            </div>
          ) : (
            <div className="divide-y divide-coffee-100">
              {coupons.map((coupon) => {
                const isExpired =
                  coupon.expiresAt && new Date(coupon.expiresAt) < new Date();
                const isMaxedOut =
                  coupon.maxUses && coupon.usedCount >= coupon.maxUses;

                return (
                  <div
                    key={coupon.id}
                    className={`p-6 ${
                      !coupon.active || isExpired || isMaxedOut
                        ? "bg-gray-50"
                        : ""
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <code className="text-lg font-mono font-bold text-coffee-900 bg-coffee-100 px-3 py-1 rounded">
                            {coupon.code}
                          </code>
                          {isExpired && (
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                              EXPIRED
                            </span>
                          )}
                          {isMaxedOut && (
                            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                              MAX USES REACHED
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                          <div>
                            <p className="text-xs text-coffee-600 uppercase mb-1">
                              Discount
                            </p>
                            <p className="text-coffee-900 font-medium">
                              {coupon.discountPercent
                                ? `${coupon.discountPercent}% off`
                                : `$${coupon.discountAmount?.toFixed(2)} off`}
                            </p>
                          </div>
                          {coupon.minPurchase && (
                            <div>
                              <p className="text-xs text-coffee-600 uppercase mb-1">
                                Min Purchase
                              </p>
                              <p className="text-coffee-900 font-medium">
                                ${coupon.minPurchase.toFixed(2)}
                              </p>
                            </div>
                          )}
                          <div>
                            <p className="text-xs text-coffee-600 uppercase mb-1">
                              Uses
                            </p>
                            <p className="text-coffee-900 font-medium">
                              {coupon.usedCount}
                              {coupon.maxUses ? ` / ${coupon.maxUses}` : ""}
                            </p>
                          </div>
                          {coupon.expiresAt && (
                            <div>
                              <p className="text-xs text-coffee-600 uppercase mb-1">
                                Expires
                              </p>
                              <p className="text-coffee-900 font-medium text-sm">
                                {new Date(coupon.expiresAt).toLocaleDateString()}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2 ml-4">
                        <ToggleCouponActiveButton
                          couponId={coupon.id}
                          isActive={coupon.active}
                        />
                        <DeleteCouponButton couponId={coupon.id} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
