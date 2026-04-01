import React from 'react';
import VehicleCard from './VehicleCard';

interface VehicleGridProps {
  vehicles: any[];
  isLoading?: boolean;
}

const VehicleGrid: React.FC<VehicleGridProps> = ({ vehicles, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="bg-gray-800/20 aspect-[4/5] rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (vehicles.length === 0) {
    return (
      <div className="text-center py-20">
        <h3 className="text-2xl text-gray-500 font-medium">No vehicles found matching your criteria.</h3>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
      {vehicles.map((vehicle) => (
        <VehicleCard key={vehicle.id} vehicle={vehicle} />
      ))}
    </div>
  );
};

export default VehicleGrid;
