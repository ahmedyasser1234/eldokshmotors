import React, { useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Autocomplete } from '@react-google-maps/api';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Search, X, Navigation, Check, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AlertModal from './AlertModal';

const mapContainerStyle = {
    width: '100%',
    height: '400px',
    borderRadius: '24px'
};

const center = {
    lat: 30.0444, // Cairo
    lng: 31.2357
};

type Library = "places" | "drawing" | "geometry" | "visualization";
const libraries: Library[] = ["places"];

interface MapPickerProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (location: { address: string; lat: number; lng: number }) => void;
    title?: string;
    initialLocation?: { lat: number; lng: number; address: string };
}

const MapPicker: React.FC<MapPickerProps> = ({ isOpen, onClose, onSelect, title, initialLocation }) => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: apiKey || '',
        libraries
    });

    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [markerPos, setMarkerPos] = useState(initialLocation || center);
    const [address, setAddress] = useState(initialLocation?.address || '');
    const [searchResult, setSearchResult] = useState<google.maps.places.Autocomplete | null>(null);
    const [isLocating, setIsLocating] = useState(false);

    // Custom Alert State
    const [alertConfig, setAlertConfig] = useState<{
        isOpen: boolean;
        message: string;
        type: 'error' | 'success' | 'warning' | 'info';
    }>({ isOpen: false, message: '', type: 'error' });

    // Sync state with props when modal opens or initialLocation changes
    React.useEffect(() => {
        if (isOpen) {
            const pos = initialLocation || center;
            setMarkerPos(pos);
            setAddress(initialLocation?.address || '');
            
            // If we have a position but no address, fetch it
            if (!initialLocation?.address && isLoaded) {
                reverseGeocode(pos);
            }
            
            if (map) {
                map.panTo(pos);
            }
        }
    }, [isOpen, initialLocation, isLoaded]);

    const onMapLoad = useCallback((map: google.maps.Map) => {
        setMap(map);
    }, []);

    const onPlaceChanged = () => {
        if (searchResult !== null) {
            const place = searchResult.getPlace();
            if (place.geometry && place.geometry.location) {
                const newPos = {
                    lat: place.geometry.location.lat(),
                    lng: place.geometry.location.lng()
                };
                setMarkerPos(newPos);
                setAddress(place.formatted_address || '');
                map?.panTo(newPos);
            }
        }
    };

    const handleMapClick = (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
            const newPos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
            setMarkerPos(newPos);
            reverseGeocode(newPos);
        }
    };

    const reverseGeocode = (pos: { lat: number; lng: number }) => {
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ location: pos }, (results, status) => {
            if (status === "OK" && results && results[0]) {
                setAddress(results[0].formatted_address);
            } else {
                console.error("Geocode failed:", status);
                if (status === 'OVER_QUERY_LIMIT' || status === 'REQUEST_DENIED') {
                  setAlertConfig({
                      isOpen: true,
                      type: 'warning',
                      message: isRTL ? "يرجى تفعيل Geocoding API في Google Cloud Console" : "Please enable Geocoding API in your Google Cloud Console"
                  });
                }
            }
        });
    };

    const handleGetCurrentLocation = () => {
        setIsLocating(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const newPos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    setMarkerPos(newPos);
                    reverseGeocode(newPos);
                    map?.panTo(newPos);
                    setIsLocating(false);
                },
                () => {
                    setIsLocating(false);
                    setAlertConfig({
                        isOpen: true,
                        type: 'error',
                        message: isRTL ? "عفواً، تعذر تحديد موقعك الحالي" : "Unable to find your current location"
                    });
                }
            );
        } else {
            setIsLocating(false);
            setAlertConfig({
                isOpen: true,
                type: 'error',
                message: isRTL ? "عفواً، متصفحك لا يدعم خاصية تحديد الموقع" : "Geolocation is not supported by your browser"
            });
        }
    };

    const handleConfirm = () => {
        onSelect({ address, lat: markerPos.lat, lng: markerPos.lng });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/80 backdrop-blur-md"
                />
                
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 40 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 40 }}
                    className="relative w-full max-w-2xl bg-[#0c0c0e] border border-white/10 rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                >
                    {/* Header */}
                    <div className="p-8 border-b border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary">
                                <MapPin size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-white tracking-tight uppercase">
                                    {title || t('booking.map.selectOnMap')}
                                </h3>
                                <p className="text-gray-500 text-xs font-bold">{t('booking.map.pickupPoint')}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-white/50 transition-all">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-8 flex-1 overflow-y-auto space-y-6">
                        {!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY_HERE' ? (
                            <div className="bg-amber-500/10 border border-amber-500/20 p-6 rounded-3xl flex flex-col items-center text-center gap-4">
                                <AlertCircle size={48} className="text-amber-500" />
                                <div className="space-y-2">
                                    <h4 className="text-white font-black uppercase text-sm tracking-widest">{isRTL ? 'مفتاح الخريطة مفقود' : 'Maps API Key Missing'}</h4>
                                    <p className="text-gray-400 text-xs font-bold max-w-xs">{isRTL ? 'يرجى إضافة VITE_GOOGLE_MAPS_API_KEY في ملف .env لتفعيل الخريطة.' : 'Please add VITE_GOOGLE_MAPS_API_KEY to your .env file to enable the map picker.'}</p>
                                </div>
                            </div>
                        ) : !isLoaded ? (
                            <div className="h-[400px] flex items-center justify-center bg-white/5 rounded-[24px]">
                                <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : (
                            <div className="relative space-y-4">
                                {/* Search Bar */}
                                <div className="flex gap-2">
                                    <div className="relative flex-1 group">
                                        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-gray-500 group-focus-within:text-brand-primary transition-colors">
                                            <Search size={18} />
                                        </div>
                                        <Autocomplete
                                            onLoad={(autocomplete) => setSearchResult(autocomplete)}
                                            onPlaceChanged={onPlaceChanged}
                                        >
                                            <input 
                                                type="text" 
                                                placeholder={t('booking.map.searchPlaceholder')}
                                                className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-5 text-sm font-bold text-white focus:outline-none focus:border-brand-primary/50 focus:bg-white/[0.08] transition-all"
                                            />
                                        </Autocomplete>
                                    </div>
                                    <button 
                                        onClick={handleGetCurrentLocation}
                                        disabled={isLocating}
                                        className="h-14 w-14 bg-brand-primary text-white rounded-2xl flex items-center justify-center hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all active:scale-95 disabled:opacity-50"
                                        title={t('booking.map.useCurrentLocation')}
                                    >
                                        <Navigation size={20} className={isLocating ? 'animate-pulse' : ''} />
                                    </button>
                                </div>

                                {/* Map */}
                                <div className="border border-white/10 rounded-[28px] overflow-hidden p-1.5 bg-white/5">
                                    <GoogleMap
                                        mapContainerStyle={mapContainerStyle}
                                        center={markerPos}
                                        zoom={15}
                                        onLoad={onMapLoad}
                                        onClick={handleMapClick}
                                        options={{
                                            styles: darkMapStyle,
                                            disableDefaultUI: true,
                                            zoomControl: true,
                                        }}
                                    >
                                        <Marker position={markerPos} />
                                    </GoogleMap>
                                </div>
                                
                                {/* Selected Address */}
                                {address && (
                                    <div className="bg-white/5 border border-white/10 p-5 rounded-3xl flex items-start gap-4">
                                        <div className="w-10 h-10 bg-brand-primary/20 rounded-xl flex items-center justify-center text-brand-primary shrink-0">
                                            <MapPin size={20} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{isRTL ? 'العنوان المحدد' : 'Selected Address'}</p>
                                            <p className="text-white text-sm font-bold leading-relaxed">{address}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-8 border-t border-white/5 bg-white/[0.02]">
                        <button 
                            onClick={handleConfirm}
                            disabled={!address}
                            className="w-full py-5 bg-brand-primary text-white font-black rounded-2xl transition-all shadow-xl shadow-brand-primary/20 hover:shadow-brand-primary/40 active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale"
                        >
                            <Check size={20} />
                            <span className="uppercase tracking-widest text-xs">{t('booking.map.confirmLocation')}</span>
                        </button>
                    </div>
                </motion.div>
                
                <AlertModal 
                    isOpen={alertConfig.isOpen}
                    onClose={() => setAlertConfig(prev => ({ ...prev, isOpen: false }))}
                    type={alertConfig.type}
                    message={alertConfig.message}
                />
            </div>
        </AnimatePresence>
    );
};

const darkMapStyle = [
    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
    {
      featureType: "administrative.locality",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }],
    },
    {
      featureType: "poi",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }],
    },
    {
      featureType: "poi.park",
      elementType: "geometry",
      stylers: [{ color: "#263c3f" }],
    },
    {
      featureType: "poi.park",
      elementType: "labels.text.fill",
      stylers: [{ color: "#6b9a76" }],
    },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ color: "#38414e" }],
    },
    {
      featureType: "road",
      elementType: "geometry.stroke",
      stylers: [{ color: "#212a37" }],
    },
    {
      featureType: "road",
      elementType: "labels.text.fill",
      stylers: [{ color: "#9ca5b3" }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry",
      stylers: [{ color: "#746855" }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry.stroke",
      stylers: [{ color: "#1f2835" }],
    },
    {
      featureType: "road.highway",
      elementType: "labels.text.fill",
      stylers: [{ color: "#f3d19c" }],
    },
    {
      featureType: "transit",
      elementType: "geometry",
      stylers: [{ color: "#2f3948" }],
    },
    {
      featureType: "transit.station",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }],
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#17263c" }],
    },
    {
      featureType: "water",
      elementType: "labels.text.fill",
      stylers: [{ color: "#515c6d" }],
    },
    {
      featureType: "water",
      elementType: "labels.text.stroke",
      stylers: [{ color: "#17263c" }],
    },
  ];

export default MapPicker;
