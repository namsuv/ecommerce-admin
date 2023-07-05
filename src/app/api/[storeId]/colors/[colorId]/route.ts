import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs"
import { z } from "zod"

import { db } from "@/lib/db"
import { ColorValidator } from "@/lib/validators/color"

export async function GET(req: Request, { params }: { params: { colorId: string } }) {
	try {
		if (!params.colorId) {
			return new NextResponse("Color id is required", { status: 400 })
		}

		const color = await db.color.findUnique({
			where: {
				id: params.colorId,
			},
		})

		return NextResponse.json(color)
	} catch (error) {
		console.log("[COLOR_GET]", error)
		return new NextResponse("Internal error", { status: 500 })
	}
}

export async function DELETE(
	req: Request,
	{ params }: { params: { colorId: string; storeId: string } }
) {
	try {
		const { userId } = auth()

		if (!userId) {
			return new NextResponse("Unauthenticated", { status: 401 })
		}

		if (!params.colorId) {
			return new NextResponse("Color id is required", { status: 400 })
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

		const color = await db.color.delete({
			where: {
				id: params.colorId,
			},
		})

		return NextResponse.json(color)
	} catch (error) {
		console.log("[COLOR_DELETE]", error)
		return new NextResponse("Internal error", { status: 500 })
	}
}

export async function PATCH(
	req: Request,
	{ params }: { params: { colorId: string; storeId: string } }
) {
	try {
		const { userId } = auth()

		const body = await req.json()

		const { name, value } = ColorValidator.parse(body)

		if (!userId) {
			return new NextResponse("Unauthenticated", { status: 401 })
		}

		if (!params.colorId) {
			return new NextResponse("Color id is required", { status: 400 })
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

		const color = await db.color.update({
			where: {
				id: params.colorId,
			},
			data: {
				name,
				value,
			},
		})

		return NextResponse.json(color)
	} catch (error) {
		if (error instanceof z.ZodError) {
			return new Response(error.message, { status: 400 })
		}

		console.log("[COLOR_PATCH]", error)
		return new NextResponse("Internal error", { status: 500 })
	}
}
