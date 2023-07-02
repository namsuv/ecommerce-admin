import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs"

import { BillBoardValidator } from "@/lib/validators/billboard"

import { z } from "zod"
import { db } from "@/lib/db"

export async function POST(req: Request, { params }: { params: { storeId: string } }) {
	try {
		const { userId } = auth()

		const body = await req.json()

		const { label, imageUrl } = BillBoardValidator.parse(body)

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

		const billboard = await db.billboard.create({
			data: {
				label,
				imageUrl,
				storeId: params.storeId,
			},
		})

		return NextResponse.json(billboard)
	} catch (error) {
		if (error instanceof z.ZodError) {
			return new Response(error.message, { status: 400 })
		}

		console.log("[BILLBOARDS_POST]", error)
		return new NextResponse("Internal error", { status: 500 })
	}
}

export async function GET(req: Request, { params }: { params: { storeId: string } }) {
	try {
		if (!params.storeId) {
			return new NextResponse("Store id is required", { status: 400 })
		}

		const billboards = await db.billboard.findMany({
			where: {
				storeId: params.storeId,
			},
		})

		return NextResponse.json(billboards)
	} catch (error) {
		console.log("[BILLBOARDS_GET]", error)
		return new NextResponse("Internal error", { status: 500 })
	}
}
