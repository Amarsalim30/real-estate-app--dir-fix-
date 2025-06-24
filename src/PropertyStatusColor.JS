export  const getStatusColor = (status) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-green-500';
      case 'SOLD': return 'bg-red-500';
      case 'RENTED': return 'bg-blue-500';
      case 'RESERVED': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };