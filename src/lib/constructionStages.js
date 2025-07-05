export const ConstructionStages = {
  PLANNING: {
    label: 'Planning & Design',
    milestone: 0,
    description: 'Project planning, permits, and design phase'
  },
  FOUNDATION: {
    label: 'Foundation',
    milestone: 15,
    description: 'Site preparation and foundation work'
  },
  STRUCTURE: {
    label: 'Structure',
    milestone: 40,
    description: 'Main structural framework construction'
  },
  ROOFING: {
    label: 'Roofing',
    milestone: 55,
    description: 'Roof installation and weatherproofing'
  },
  INTERIOR: {
    label: 'Interior Work',
    milestone: 75,
    description: 'Interior framing, electrical, and plumbing'
  },
  FINISHING: {
    label: 'Finishing',
    milestone: 90,
    description: 'Final finishes, fixtures, and details'
  },
  COMPLETED: {
    label: 'Completed',
    milestone: 100,
    description: 'Project completed and ready for occupancy'
  }
};

export const getConstructionStageColor = (stage) => {
  switch (stage) {
    case 'PLANNING':
      return 'bg-gray-100 text-gray-800';
    case 'FOUNDATION':
      return 'bg-orange-100 text-orange-800';
    case 'STRUCTURE':
      return 'bg-blue-100 text-blue-800';
    case 'ROOFING':
      return 'bg-purple-100 text-purple-800';
    case 'INTERIOR':
      return 'bg-indigo-100 text-indigo-800';
    case 'FINISHING':
      return 'bg-yellow-100 text-yellow-800';
    case 'COMPLETED':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getConstructionProgressPercentage = (stage) => {
  return ConstructionStages[stage]?.milestone || 0;
};

export const getNextConstructionStage = (currentStage) => {
  const stages = Object.keys(ConstructionStages);
  const currentIndex = stages.indexOf(currentStage);
  
  if (currentIndex === -1 || currentIndex === stages.length - 1) {
    return null;
  }
  
  return stages[currentIndex + 1];
};

export const getPreviousConstructionStage = (currentStage) => {
  const stages = Object.keys(ConstructionStages);
  const currentIndex = stages.indexOf(currentStage);
  
  if (currentIndex <= 0) {
    return null;
  }
  
  return stages[currentIndex - 1];
};

export const isStageCompleted = (currentStage, targetStage) => {
  const currentMilestone = ConstructionStages[currentStage]?.milestone || 0;
  const targetMilestone = ConstructionStages[targetStage]?.milestone || 0;
  
  return currentMilestone >= targetMilestone;
};
