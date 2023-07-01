import { z } from "zod"

export const SettingsValidator = z.object({
	name: z.string().min(2),
})