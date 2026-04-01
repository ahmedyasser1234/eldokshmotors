import React from 'react';
import { Truck, MapPin, CheckCircle, Clock } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';

const DriverDashboard: React.FC = () => {
  const assignedRides = [
    {
      id: '1',
      customer: 'Ahmed Ali',
      vehicle: 'Mercedes S-Class',
      pickup: 'New Cairo, Egypt',
      dropoff: 'Alexandria Desert Road',
      time: '12:00 PM',
      date: 'March 14, 2026',
      status: 'assigned',
    },
    {
      id: '2',
      customer: 'John Doe',
      vehicle: 'Land Cruiser VXR',
      pickup: 'Cairo International Airport',
      dropoff: 'Maadi, Cairo',
      time: '03:30 PM',
      date: 'March 14, 2026',
      status: 'pending',
    },
  ];

  return (
    <DashboardLayout 
      role="driver" 
      title="Driver Console" 
      subtitle="Manage your assigned professional chauffeured rides"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-950 border border-gray-900 p-6 rounded-2xl">
            <h4 className="text-gray-500 font-medium mb-1">Today's Rides</h4>
            <div className="text-3xl font-bold text-white">4</div>
          </div>
          <div className="bg-gray-950 border border-gray-900 p-6 rounded-2xl">
            <h4 className="text-gray-500 font-medium mb-1">Total Distance</h4>
            <div className="text-3xl font-bold text-white">128 km</div>
          </div>
          <div className="bg-gray-950 border border-gray-900 p-6 rounded-2xl">
            <h4 className="text-gray-500 font-medium mb-1">Earnings Today</h4>
            <div className="text-3xl font-bold text-amber-500">240.00 EGP</div>
          </div>
        </div>

        <div className="bg-gray-950 border border-gray-900 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-gray-900 flex justify-between items-center">
            <h3 className="text-xl font-bold text-white">Your Schedule</h3>
            <button className="text-amber-500 font-medium hover:underline">View Calendar</button>
          </div>
          <div className="divide-y divide-gray-900">
            {assignedRides.map((ride) => (
              <div key={ride.id} className="p-6 hover:bg-gray-900/40 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${ride.status === 'assigned' ? 'bg-amber-500/10' : 'bg-gray-800'}`}>
                      <Truck className={ride.status === 'assigned' ? 'text-amber-500' : 'text-gray-400'} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h4 className="text-lg font-bold text-white">{ride.customer}</h4>
                        {ride.status === 'assigned' && (
                          <span className="bg-amber-500/10 text-amber-500 text-xs font-bold px-2 py-1 rounded-full uppercase tracking-tighter">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-gray-400 font-medium">{ride.vehicle}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 max-w-xl">
                    <div className="flex items-center gap-2 text-gray-400">
                      <MapPin className="w-4 h-4 text-amber-500" />
                      <span className="text-sm truncate">{ride.pickup} &rarr; {ride.dropoff}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <Clock className="w-4 h-4 text-amber-500" />
                      <span className="text-sm">{ride.date} at {ride.time}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {ride.status === 'pending' ? (
                      <button className="bg-amber-500 text-black px-6 py-2 rounded-xl font-bold hover:bg-amber-400 transition-colors">
                        Accept Ride
                      </button>
                    ) : (
                      <button className="bg-white text-black px-6 py-2 rounded-xl font-bold hover:bg-gray-200 transition-colors flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Complete Ride
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DriverDashboard;
