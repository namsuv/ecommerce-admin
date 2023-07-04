import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs"

import { z } from "zod"
import { db } from "@/lib/db"
import { CategoryValidator } from "@/lib/validators/category"

export async function POST(req: Request, { params }: { params: { storeId: string } }) {
	try {
		const { userId } = auth()

		const body = await req.json()

		const { name, billboardId } = CategoryValidator.parse(body)

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

		const category = await db.category.create({
			data: {
				name,
				billboardId,
				storeId: params.storeId,
			},
		})

		return NextResponse.json(category)
	} catch (error) {
		if (error instanceof z.ZodError) {
			return new Response(error.message, { status: 400 })
		}

		console.log("[CATEGORIES_POST]", error)
		return new NextResponse("Internal error", { status: 500 })
	}
}

export async function GET(req: Request, { params }: { params: { storeId: string } }) {
	try {
		if (!params.storeId) {
			return new NextResponse("Store id is required", { status: 400 })
		}

		const categories = await db.category.findMany({
			where: {
				storeId: params.storeId,
			},
		})

		return NextResponse.json(categories)
	} catch (error) {
		console.log("[CATEGORIES_GET]", error)
		return new NextResponse("Internal error", { status: 500 })
	}
}
