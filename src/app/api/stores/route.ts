import { db } from "@/lib/db"
import { StoreValidator } from "@/lib/validators/store"
import { auth } from "@clerk/nextjs"
import { NextResponse } from "next/server"
import { z } from "zod"

export async function POST(req: Request) {
	try {
		const body = await req.json()

		const { name } = StoreValidator.parse(body)

		const { userId } = auth()

		if (!userId) {
			return new NextResponse("Unauthorized", { status: 401 })
		}

		const store = await db.store.create({
			data: {
				name,
				userId,
			},
		})

		return NextResponse.json(store)
	} catch (error) {
		if (error instanceof z.ZodError) {
			return new Response(error.message, { status: 400 })
		}

		return new NextResponse("Internal error", { status: 500 })
	}
}
