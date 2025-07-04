import { NextResponse } from 'next/server'

// Fallback mock data
const mockInvoices = [
  {
    id: 1,
    amount: 50000,
    status: "PENDING",
    dueDate: "2025-07-15",
    createdAt: "2025-07-01T10:00:00Z",
    updatedAt: "2025-07-01T10:00:00Z",
  },
  {
    id: 2,
    amount: 80000,
    status: "PAID",
    dueDate: "2025-06-20",
    createdAt: "2025-06-01T10:00:00Z",
    updatedAt: "2025-06-20T10:00:00Z",
  }
]

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const params = Object.fromEntries(searchParams)

    try {
      const response = await fetch("http://localhost:8080/api/invoices", {
        headers: { 'Content-Type': 'application/json' },
      })

      if (response.ok) {
        const invoices = await response.json()
        return NextResponse.json({
          success: true,
          data: invoices,
          total: invoices.length,
          source: 'backend'
        })
      }
    } catch (backendError) {
      console.warn('Backend unavailable, using mock data:', backendError.message)
    }

    return NextResponse.json({
      success: true,
      data: mockInvoices,
      total: mockInvoices.length,
      source: 'mock'
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch invoices",
        error: error.message,
      },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const data = await request.json()

    if (!data.amount || !data.dueDate) {
      return NextResponse.json(
        { success: false, message: "Amount and due date are required" },
        { status: 400 }
      )
    }

    try {
      const response = await fetch("http://localhost:8080/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        const createdInvoice = await response.json()
        return NextResponse.json({
          success: true,
          message: "Invoice created successfully",
          data: createdInvoice,
        }, { status: 201 })
      }
    } catch (backendError) {
      console.warn('Backend unavailable for POST:', backendError.message)
    }

    const newInvoice = {
      id: Date.now(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      message: "Invoice created successfully (mock)",
      data: newInvoice,
    }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create invoice",
        error: error.message,
      },
      { status: 500 }
    )
  }
}

export async function PUT(request) {
  try {
    const data = await request.json()

    if (!data.id) {
      return NextResponse.json(
        { success: false, message: "Invoice ID is required" },
        { status: 400 }
      )
    }

    try {
      const response = await fetch(`http://localhost:8080/api/invoices/${data.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        const updatedInvoice = await response.json()
        return NextResponse.json({
          success: true,
          message: "Invoice updated successfully",
          data: updatedInvoice,
        })
      }
    } catch (backendError) {
      console.warn('Backend unavailable for PUT:', backendError.message)
    }

    const updatedInvoice = {
      ...data,
      updatedAt: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      message: "Invoice updated successfully (mock)",
      data: updatedInvoice,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to update invoice", error: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(request) {
  try {
    const { id } = await request.json()

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Invoice ID is required" },
        { status: 400 }
      )
    }

    try {
      const response = await fetch(`http://localhost:8080/api/invoices/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        return NextResponse.json({
          success: true,
          message: `Invoice with id ${id} deleted successfully`,
        })
      }
    } catch (backendError) {
      console.warn('Backend unavailable for DELETE:', backendError.message)
    }

    return NextResponse.json({
      success: true,
      message: `Invoice with id ${id} deleted successfully (mock)`,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to delete invoice", error: error.message },
      { status: 500 }
    )
  }
}
