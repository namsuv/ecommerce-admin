import { db } from "@/lib/db";
import { format } from "date-fns";
import { ColorColumn } from "./columns";
import { ColorClient } from "./client";

const ColorsPage = async ({
  params
}: {
  params: { storeId: string }
}) => {
  const colors = await db.color.findMany({
    where: {
      storeId: params.storeId
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  const formattedColors: ColorColumn[] = colors.map((item) => ({
    id: item.id,
    name: item.name,
    value: item.value,
    createdAt: format(item.createdAt, 'MMMM do, yyyy'),
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ColorClient data={formattedColors} />
      </div>
    </div>
  );
};

export default ColorsPage;