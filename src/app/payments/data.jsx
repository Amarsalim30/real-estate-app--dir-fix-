const transactions = [
    {
      id: 'TXN-2024-001',
      date: '2024-06-10',
      type: 'Property Purchase',
      property: '123 Sunset Boulevard, Beverly Hills, CA',
      amount: 2850000,
      status: 'Completed',
      buyer: 'John Smith',
      seller: 'Sarah Johnson',
      agent: 'Mike Wilson - Century 21',
      details: {
        purchasePrice: 2850000,
        downPayment: 570000,
        loanAmount: 2280000,
        closingCosts: 42750,
        agentCommission: 171000,
        titleInsurance: 8550,
        inspectionFee: 850,
        appraisalFee: 650,
        escrowFee: 2850
      }
    },
    {
      id: 'TXN-2024-002',
      date: '2024-06-08',
      type: 'Property Sale',
      property: '456 Ocean Drive, Malibu, CA',
      amount: 1750000,
      status: 'Completed',
      buyer: 'Emily Davis',
      seller: 'Robert Chen',
      agent: 'Lisa Thompson - Coldwell Banker',
      details: {
        salePrice: 1750000,
        agentCommission: 105000,
        titleInsurance: 5250,
        escrowFee: 1750,
        proRatedTaxes: 12500,
        repairCredits: 8500,
        netProceeds: 1617000
      }
    },
    {
      id: 'TXN-2024-003',
      date: '2024-06-05',
      type: 'Refinancing',
      property: '789 Mountain View, Pasadena, CA',
      amount: 425000,
      status: 'Processing',
      buyer: 'David Wilson',
      seller: 'N/A',
      agent: 'Amanda Rodriguez - HomeLoan Express',
      details: {
        newLoanAmount: 425000,
        oldLoanBalance: 380000,
        cashOut: 45000,
        originationFee: 4250,
        appraisalFee: 600,
        titleInsurance: 1275,
        recordingFee: 125
      }
    },
    {
      id: 'TXN-2024-004',
      date: '2024-06-01',
      type: 'Rental Payment',
      property: '321 Downtown Loft, Los Angeles, CA',
      amount: 4500,
      status: 'Completed',
      buyer: 'Maria Garcia (Tenant)',
      seller: 'Property Management Co.',
      agent: 'N/A',
      details: {
        monthlyRent: 4500,
        lateFee: 0,
        petFee: 50,
        utilities: 150,
        managementFee: 270
      }
    },
    {
      id: 'TXN-2024-005',
      date: '2024-05-28',
      type: 'Property Investment',
      property: '654 Industrial Park, Long Beach, CA',
      amount: 3200000,
      status: 'Pending',
      buyer: 'Investment Group LLC',
      seller: 'Industrial Holdings Inc.',
      agent: 'Commercial Realty Partners',
      details: {
        purchasePrice: 3200000,
        earnestMoney: 64000,
        inspectionPeriod: '30 days',
        expectedClosing: '2024-07-15',
        brokerFee: 96000,
        dueDiligence: 15000
      }
    }
  ];

  export default transactions;