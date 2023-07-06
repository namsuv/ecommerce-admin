import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs"

import { ProductValidator } from "@/lib/validators/product"
import { db } from "@/lib/db"

export async function GET(req: Request, { params }: { params: { productId: string } }) {
	try {
		if (!params.productId) {
			return new NextResponse("Product id is required", { status: 400 })
		}

		const product = await db.product.findUnique({
			where: {
				id: params.productId,
			},
			include: {
				images: true,
				category: true,
				size: true,
				color: true,
			},
		})

		return NextResponse.json(product)
	} catch (error) {
		console.log("[PRODUCT_GET]", error)
		return new NextResponse("Internal error", { status: 500 })
	}
}

export async function DELETE(
	req: Request,
	{ params }: { params: { productId: string; storeId: string } }
) {
	try {
		const { userId } = auth()

		if (!userId) {
			return new NextResponse("Unauthenticated", { status: 403 })
		}

		if (!params.productId) {
			return new NextResponse("Product id is required", { status: 400 })
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

		const product = await db.product.delete({
			where: {
				id: params.productId,
			},
		})

		return NextResponse.json(product)
	} catch (error) {
		console.log("[PRODUCT_DELETE]", error)
		return new NextResponse("Internal error", { status: 500 })
	}
}

export async function PATCH(
	req: Request,
	{ params }: { params: { productId: string; storeId: string } }
) {
	try {
		const { userId } = auth()

		const body = await req.json()

		const { name, price, categoryId, images, colorId, sizeId, isFeatured, isArchived } =
			ProductValidator.parse(body)

		if (!userId) {
			return new NextResponse("Unauthenticated", { status: 401 })
		}

		if (!params.productId) {
			return new NextResponse("Product id is required", { status: 400 })
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

		await db.product.update({
			where: {
				id: params.productId,
			},
			data: {
				name,
				price,
				categoryId,
				colorId,
				sizeId,
				images: {
					deleteMany: {},
				},
				isFeatured,
				isArchived,
			},
		})

		const product = await db.product.update({
			where: {
				id: params.productId,
			},
			data: {
				images: {
					createMany: {
						data: [...images.map((image: { url: string }) => image)],
					},
				},
			},
		})

		return NextResponse.json(product)
	} catch (error) {
		console.log("[PRODUCT_PATCH]", error)
		return new NextResponse("Internal error", { status: 500 })
	}
}
