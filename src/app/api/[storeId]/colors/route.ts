import { NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@clerk/nextjs"

import { db } from "@/lib/db"
import { ColorValidator } from "@/lib/validators/color"

export async function POST(req: Request, { params }: { params: { storeId: string } }) {
	try {
		const { userId } = auth()

		const body = await req.json()

		const { name, value } = ColorValidator.parse(body)

		if (!userId) {
			return new NextResponse("Unauthenticated", { status: 401 })
		}

		if (!params.storeId) {
			return new NextResponse("Store id is required", { status: 400 })
		}

		const storeByUserId = await db.store.findFirst({
			where: {
				id: params.storeId,
				userId,
			},
		})

		if (!storeByUserId) {
			return new NextResponse("Unauthorized", { status: 405 })
		}

		const color = await db.color.create({
			data: {
				name,
				value,
				storeId: params.storeId,
			},
		})

		return NextResponse.json(color)
	} catch (error) {
    if (error instanceof z.ZodError) {
			return new Response(error.message, { status: 400 })
		}

		console.log("[COLORS_POST]", error)
		return new NextResponse("Internal error", { status: 500 })
	}
}

export async function GET(req: Request, { params }: { params: { storeId: string } }) {
	try {
		if (!params.storeId) {
			return new NextResponse("Store id is required", { status: 400 })
		}

		const colors = await db.color.findMany({
			where: {
				storeId: params.storeId,
			},
		})

		return NextResponse.json(colors)
	} catch (error) {
		console.log("[COLORS_GET]", error)
		return new NextResponse("Internal error", { status: 500 })
	}
}
