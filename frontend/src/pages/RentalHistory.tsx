import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Search, ArrowUpRight, Download } from 'lucide-react';

const RentalHistory: React.FC = () => {
    return (
        <DashboardLayout role="customer" title="Rental History">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-black tracking-tight mb-2">My Journeys</h1>
                    <p className="text-gray-500 font-medium">Review your past rentals and download invoices.</p>
                </div>
                <div className="flex gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                        <input type="text" placeholder="Search history..." className="bg-gray-900/40 border border-gray-800 rounded-2xl px-12 py-3.5 focus:border-blue-500 outline-none w-64 text-sm" />
                    </div>
                </div>
            </div>

            <div className="bg-gray-900/40 border border-gray-800 rounded-[40px] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-gray-500 text-[10px] font-black uppercase tracking-widest border-b border-gray-800">
                                <th className="px-10 py-6">Vehicle</th>
                                <th className="px-10 py-6">Rental Period</th>
                                <th className="px-10 py-6">Total Paid</th>
                                <th className="px-10 py-6">Status</th>
                                <th className="px-10 py-6">Invoice</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/50">
                            {[
                                { car: 'G-Class AMG', date: 'May 12 - May 15, 2024', price: '2,400 EGP', status: 'Active', color: 'blue' },
                                { car: 'Range Rover SV', date: 'Apr 20 - Apr 22, 2024', price: '1,800 EGP', status: 'Completed', color: 'green' },
                                { car: 'Aston Martin DB11', date: 'Mar 10 - Mar 12, 2024', price: '3,500 EGP', status: 'Completed', color: 'green' },
                            ].map((item, i) => (
                                <tr key={i} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-gray-950 border border-gray-800 flex items-center justify-center font-black text-gray-400 group-hover:text-blue-500 transition-colors">
                                                {item.car.charAt(0)}
                                            </div>
                                            <span className="font-black text-lg">{item.car}</span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <p className="font-bold">{item.date}</p>
                                        <p className="text-[10px] text-gray-600 uppercase font-black tracking-widest mt-1">3 Days Rental</p>
                                    </td>
                                    <td className="px-10 py-8 font-black text-xl text-blue-500">{item.price}</td>
                                    <td className="px-10 py-8">
                                        <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-2xl ${
                                            item.status === 'Active' ? 'bg-blue-600/10 text-blue-500 border border-blue-500/20 shadow-lg shadow-blue-900/10' : 'bg-green-500/10 text-green-500 border border-green-500/10'
                                        }`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-10 py-8">
                                        <button className="flex items-center gap-2 p-3 bg-gray-950 border border-gray-800 rounded-xl text-gray-500 hover:text-white hover:border-gray-600 transition-all group/btn">
                                            <Download size={16} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">PDF</span>
                                            <ArrowUpRight size={14} className="opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default RentalHistory;
