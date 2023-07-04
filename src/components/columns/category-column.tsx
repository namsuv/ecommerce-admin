"use client"

import { ColumnDef } from "@tanstack/react-table"
import { CategoryCellAction } from "./category-cell";

export type CategoryColumn = {
  id: string
  name: string;
  billboardLabel: string;
  createdAt: string;
}

export const categoryColumns: ColumnDef<CategoryColumn>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "billboard",
    header: "Billboard",
    cell: ({ row }) => row.original.billboardLabel,
  },
  {
    accessorKey: "createdAt",
    header: "Date",
  },
  {
    id: "actions",
    cell: ({ row }) => <CategoryCellAction data={row.original} />
  },
];