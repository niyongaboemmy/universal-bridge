import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { EmployeeForm } from "@/components/office/controls";
import { Card, PageHeader } from "@/components/office/ui";
import { listEmployees } from "@/features/office/data";
import { requireArea } from "@/features/office/session";

export const metadata = { title: "Add employee" };

export default async function NewEmployee() {
  const user = await requireArea("people");
  const managers = (await listEmployees(user))
    .filter((e) => e.status !== "left")
    .map((e) => ({ id: e.id, name: e.name }));
  return (
    <div className="grid max-w-3xl gap-6">
      <Link
        href="/office/people"
        className="inline-flex w-fit items-center gap-1.5 text-body-sm text-fg-secondary hover:text-fg"
      >
        <ArrowLeft className="size-4" aria-hidden /> Employees
      </Link>
      <PageHeader title="Add employee" />
      <Card>
        <EmployeeForm managers={managers} />
      </Card>
    </div>
  );
}
