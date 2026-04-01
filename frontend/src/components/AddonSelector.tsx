import React from 'react';
import { Check, Info } from 'lucide-react';

interface Addon {
  id: string;
  name: string;
  price: number;
  description: string;
}

interface AddonSelectorProps {
  addons: Addon[];
  selectedAddonIds: string[];
  onChange: (addonIds: string[]) => void;
}

const AddonSelector: React.FC<AddonSelectorProps> = ({ addons, selectedAddonIds, onChange }) => {
  const toggleAddon = (id: string) => {
    if (selectedAddonIds.includes(id)) {
      onChange(selectedAddonIds.filter(addonId => addonId !== id));
    } else {
      onChange([...selectedAddonIds, id]);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <Info className="text-amber-500 w-5 h-5" />
        Enhance Your Experience
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {addons.map((addon) => (
          <div
            key={addon.id}
            onClick={() => toggleAddon(addon.id)}
            className={`cursor-pointer p-4 rounded-xl border-2 transition-all duration-300 flex items-center justify-between ${
              selectedAddonIds.includes(addon.id)
                ? 'bg-amber-500/10 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                : 'bg-gray-900/50 border-gray-800 hover:border-gray-700'
            }`}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white">{addon.name}</span>
                <span className="text-amber-500 font-mono text-sm">${addon.price}/day</span>
              </div>
              <p className="text-gray-400 text-sm mt-1">{addon.description}</p>
            </div>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
              selectedAddonIds.includes(addon.id)
                ? 'bg-amber-500 border-amber-500'
                : 'border-gray-700'
            }`}>
              {selectedAddonIds.includes(addon.id) && <Check className="text-black w-4 h-4 stroke-[3px]" />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AddonSelector;
