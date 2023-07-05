import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs"
import { z } from "zod"

import { db } from "@/lib/db"
import { SizeValidator } from "@/lib/validators/size"

export async function GET(req: Request, { params }: { params: { sizeId: string } }) {
	try {
		if (!params.sizeId) {
			return new NextResponse("Size id is required", { status: 400 })
		}

		const size = await db.size.findUnique({
			where: {
				id: params.sizeId,
			},
		})

		return NextResponse.json(size)
	} catch (error) {
		console.log("[SIZE_GET]", error)
		return new NextResponse("Internal error", { status: 500 })
	}
}

export async function DELETE(
	req: Request,
	{ params }: { params: { sizeId: string; storeId: string } }
) {
	try {
		const { userId } = auth()

		if (!userId) {
			return new NextResponse("Unauthenticated", { status: 401 })
		}

		if (!params.sizeId) {
			return new NextResponse("Size id is required", { status: 400 })
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

		const size = await db.size.delete({
			where: {
				id: params.sizeId,
			},
		})

		return NextResponse.json(size)
	} catch (error) {
		console.log("[SIZE_DELETE]", error)
		return new NextResponse("Internal error", { status: 500 })
	}
}

export async function PATCH(
	req: Request,
	{ params }: { params: { sizeId: string; storeId: string } }
) {
	try {
		const { userId } = auth()

		const body = await req.json()

		const { name, value } = SizeValidator.parse(body)

		if (!userId) {
			return new NextResponse("Unauthenticated", { status: 401 })
		}

		if (!params.sizeId) {
			return new NextResponse("Size id is required", { status: 400 })
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

		const size = await db.size.update({
			where: {
				id: params.sizeId,
			},
			data: {
				name,
				value,
			},
		})

		return NextResponse.json(size)
	} catch (error) {
		if (error instanceof z.ZodError) {
			return new Response(error.message, { status: 400 })
		}

		console.log("[SIZE_PATCH]", error)
		return new NextResponse("Internal error", { status: 500 })
	}
}
