import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs"
import { z } from "zod"

import { db } from "@/lib/db"
import { SettingsValidator } from "@/lib/validators/settings"

export async function PATCH(req: Request, { params }: { params: { storeId: string } }) {
	try {
		const body = await req.json()

		const { name } = SettingsValidator.parse(body)

		const { userId } = auth()

		if (!userId) {
			return new NextResponse("Unauthorized", { status: 401 })
		}

		if (!params.storeId) {
			return new NextResponse("Store id is required", { status: 400 })
		}

		const store = await db.store.updateMany({
			where: {
				id: params.storeId,
				userId,
			},
			data: {
				name,
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

export async function DELETE(req: Request, { params }: { params: { storeId: string } }) {
	try {
		const { userId } = auth()

		if (!userId) {
			return new NextResponse("Unauthorized", { status: 401 })
		}

		if (!params.storeId) {
			return new NextResponse("Store id is required", { status: 400 })
		}

		const store = await db.store.deleteMany({
			where: {
				id: params.storeId,
				userId,
			},
		})

		return NextResponse.json(store)
	} catch (error) {
		return new NextResponse("Internal error", { status: 500 })
	}
}
