import { NextResponse } from "next/server"

// Mock data for individual buyer
const mockBuyers = [
  {
    id: 1,
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "+254712345678",
    address: "123 Main St",
    city: "Nairobi",
    state: "Nairobi",
    postalCode: "00100",
    dateOfBirth: "1985-06-15",
    occupation: "Software Engineer",
    annualIncome: 2400000,
    creditScore: 750,
    preferredContactMethod: "email",
    notes: "Preferred customer",
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:30:00Z"
  },
  {
    id: 2,
    firstName: "Jane",
    lastName: "Smith",
    email: "jane.smith@example.com",
    phone: "+254723456789",
    address: "456 Oak Ave",
    city: "Mombasa",
    state: "Mombasa",
    postalCode: "80100",
    dateOfBirth: "1990-03-22",
    occupation: "Business Owner",
    annualIncome: 3600000,
    creditScore: 720,
    preferredContactMethod: "phone",
    notes: "VIP client",
    createdAt: "2024-01-10T14:20:00Z",
    updatedAt: "2024-01-10T14:20:00Z"
  },
  {
    id: 3,
    firstName: "Michael",
    lastName: "Johnson",
    email: "michael.johnson@example.com",
    phone: "+254734567890",
    address: "789 Pine Rd",
    city: "Kisumu",
    state: "Kisumu",
    postalCode: "40100",
    dateOfBirth: "1988-11-08",
    occupation: "Doctor",
    annualIncome: 4800000,
    creditScore: 780,
    preferredContactMethod: "email",
    notes: "Excellent payment history",
    createdAt: "2023-12-20T09:15:00Z",
    updatedAt: "2023-12-20T09:15:00Z"
  }
];

export async function GET(request, { params }) {
  try {
    const { id } = params
    const buyerId = parseInt(id)

    // Try backend first
    try {
      const response = await fetch(`http://localhost:8080/api/buyers/${id}`)
      if (response.ok) {
        const buyer = await response.json()
        return NextResponse.json({
          success: true,
          data: buyer
        })
      }
    } catch (backendError) {
      console.warn('Backend unavailable, using mock data:', backendError.message)
    }

    // Fallback to mock data
    const buyer = mockBuyers.find(b => b.id === buyerId)
    
    if (!buyer) {
      return NextResponse.json(
        { success: false, message: "Buyer not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: buyer
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch buyer", error: error.message },
      { status: 500 }
    )
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params
    const data = await request.json()

    // Try backend first
    try {
      const response = await fetch(`http://localhost:8080/api/buyers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        const updatedBuyer = await response.json()
        return NextResponse.json({
          success: true,
          message: "Buyer updated successfully",
          data: updatedBuyer
        })
      }
    } catch (backendError) {
      console.warn('Backend unavailable for PUT:', backendError.message)
    }

    // Fallback: simulate update
    const updatedBuyer = {
      id: parseInt(id),
      ...data,
      updatedAt: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      message: "Buyer updated successfully (mock)",
      data: updatedBuyer
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to update buyer", error: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params

    // Try backend first
    try {
      const response = await fetch(`/api/buyers/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        return NextResponse.json({
          success: true,
          message: `Buyer with id ${id} deleted successfully`
        })
      }
    } catch (backendError) {
      console.warn('Backend unavailable for DELETE:', backendError.message)
    }

    // Fallback: simulate deletion
    return NextResponse.json({
      success: true,
      message: `Buyer with id ${id} deleted successfully (mock)`
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to delete buyer", error: error.message },
      { status: 500 }
    )
  }
}
