import { z } from "zod"

export const BillBoardValidator = z.object({
	label: z.string().min(1),
	imageUrl: z.string().min(1),
})
