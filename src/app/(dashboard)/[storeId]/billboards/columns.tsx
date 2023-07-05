"use client"

import { ColumnDef } from "@tanstack/react-table"

import { BillBoardCellAction } from "./cell-action";

export type BillboardColumn = {
  id: string
  label: string;
  createdAt: string;
}

export const billboardColumns: ColumnDef<BillboardColumn>[] = [
  {
    accessorKey: "label",
    header: "Label",
  },
  {
    accessorKey: "createdAt",
    header: "Date",
  },
  {
    id: "actions",
    cell: ({ row }) => <BillBoardCellAction data={row.original} />
  },
];