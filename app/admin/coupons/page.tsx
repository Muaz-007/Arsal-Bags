import { CouponsManager } from "@/components/admin/coupons-manager";
import { listCoupons } from "@/lib/queries";

export default async function AdminCouponsPage() {
  const coupons = await listCoupons();
  return <CouponsManager initial={coupons} />;
}
