import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs"

import { db } from "@/lib/db"
import { BillBoardValidator } from "@/lib/validators/billboard"

import { z } from "zod"

export async function GET(req: Request, { params }: { params: { billboardId: string } }) {
	try {
		if (!params.billboardId) {
			return new NextResponse("Billboard id is required", { status: 400 })
		}

		const billboard = await db.billboard.findUnique({
			where: {
				id: params.billboardId,
			},
		})

		return NextResponse.json(billboard)
	} catch (error) {
		console.log("[BILLBOARD_GET]", error)
		return new NextResponse("Internal error", { status: 500 })
	}
}

export async function DELETE(
	req: Request,
	{ params }: { params: { billboardId: string; storeId: string } }
) {
	try {
		const { userId } = auth()

		if (!userId) {
			return new NextResponse("Unauthenticated", { status: 401 })
		}

		if (!params.billboardId) {
			return new NextResponse("Billboard id is required", { status: 400 })
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

		const billboard = await db.billboard.delete({
			where: {
				id: params.billboardId,
			},
		})

		return NextResponse.json(billboard)
	} catch (error) {
		console.log("[BILLBOARD_DELETE]", error)
		return new NextResponse("Internal error", { status: 500 })
	}
}

export async function PATCH(
	req: Request,
	{ params }: { params: { billboardId: string; storeId: string } }
) {
	try {
		const { userId } = auth()

		const body = await req.json()

		const { label, imageUrl } = BillBoardValidator.parse(body)

		if (!userId) {
			return new NextResponse("Unauthenticated", { status: 401 })
		}

		if (!params.billboardId) {
			return new NextResponse("Billboard id is required", { status: 400 })
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

		const billboard = await db.billboard.update({
			where: {
				id: params.billboardId,
			},
			data: {
				label,
				imageUrl,
			},
		})

		return NextResponse.json(billboard)
	} catch (error) {
		if (error instanceof z.ZodError) {
			return new Response(error.message, { status: 400 })
		}

		console.log("[BILLBOARD_PATCH]", error)
		return new NextResponse("Internal error", { status: 500 })
	}
}
