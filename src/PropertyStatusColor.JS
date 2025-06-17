export  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'sold': return 'bg-red-500';
      case 'rented': return 'bg-blue-500';
      case 'reserved': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };