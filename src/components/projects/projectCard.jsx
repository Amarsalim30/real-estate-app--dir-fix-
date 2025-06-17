'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Units } from '@/data/units';
import { formatPrice } from '@/utils/format';

export default function ProjectCard({ project }) {
  const router = useRouter();
  const [imageError, setImageError] = useState(false);

  // Calculate project statistics
  const projectUnits = Units.filter(unit => unit.projectId === project.id);
  const soldUnits = projectUnits.filter(unit => unit.status === 'sold').length;
  const reservedUnits = projectUnits.filter(unit => unit.status === 'reserved').length;
  const availableUnits = projectUnits.filter(unit => unit.status === 'available').length;
  const totalUnits = projectUnits.length;
  
  const salesProgress = totalUnits > 0 ? ((soldUnits + reservedUnits) / totalUnits * 100) : 0;
  
  // Price range
  const prices = projectUnits.map(unit => unit.price).filter(price => price > 0);
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

  const handleCardClick = () => {
    router.push(`/projects/${project.id}`);
  };
}