import React, { useState, useEffect } from 'react';
import { MapPin, ChevronDown } from 'lucide-react';
import { getProvinces, getDistricts, getNeighborhoods } from '../../utils/addressData';

/**
 * Cascading address selector component
 * İl → İlçe → Mahalle dropdown selectors
 */
const AddressSelector = ({
    value = { il: '', ilce: '', mahalle: '', adres: '' },
    onChange,
    errors = {},
    showStreetAddress = true,
    required = false
}) => {
    const [provinces] = useState(getProvinces());
    const [districts, setDistricts] = useState([]);
    const [neighborhoods, setNeighborhoods] = useState([]);

    // Update districts when province changes
    useEffect(() => {
        if (value.il) {
            setDistricts(getDistricts(value.il));
        } else {
            setDistricts([]);
        }
        setNeighborhoods([]);
    }, [value.il]);

    // Update neighborhoods when district changes
    useEffect(() => {
        if (value.il && value.ilce) {
            setNeighborhoods(getNeighborhoods(value.il, value.ilce));
        } else {
            setNeighborhoods([]);
        }
    }, [value.il, value.ilce]);

    const handleProvinceChange = (e) => {
        const newProvince = e.target.value;
        onChange({
            il: newProvince,
            ilce: '',
            mahalle: '',
            adres: value.adres || ''
        });
    };

    const handleDistrictChange = (e) => {
        const newDistrict = e.target.value;
        onChange({
            ...value,
            ilce: newDistrict,
            mahalle: ''
        });
    };

    const handleNeighborhoodChange = (e) => {
        onChange({
            ...value,
            mahalle: e.target.value
        });
    };

    const handleAddressChange = (e) => {
        onChange({
            ...value,
            adres: e.target.value
        });
    };

    const selectClassName = (hasError) => `
    w-full px-4 py-3 rounded-xl border transition-all duration-200
    bg-white text-gray-900
    focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500
    ${hasError
            ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500'
            : 'border-gray-200 hover:border-gray-300'
        }
    appearance-none cursor-pointer
  `;

    return (
        <div className="space-y-4">
            {/* Province & District Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* İl (Province) */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        İl {required && <span className="text-red-500">*</span>}
                    </label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <select
                            value={value.il}
                            onChange={handleProvinceChange}
                            className={`${selectClassName(errors.il)} pl-10`}
                            required={required}
                        >
                            <option value="">İl Seçiniz</option>
                            {provinces.map((province) => (
                                <option key={province} value={province}>
                                    {province}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                    {errors.il && (
                        <p className="mt-1 text-sm text-red-500">{errors.il}</p>
                    )}
                </div>

                {/* İlçe (District) */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        İlçe {required && <span className="text-red-500">*</span>}
                    </label>
                    <div className="relative">
                        <select
                            value={value.ilce}
                            onChange={handleDistrictChange}
                            className={selectClassName(errors.ilce)}
                            disabled={!value.il}
                            required={required}
                        >
                            <option value="">İlçe Seçiniz</option>
                            {districts.map((district) => (
                                <option key={district} value={district}>
                                    {district}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                    {errors.ilce && (
                        <p className="mt-1 text-sm text-red-500">{errors.ilce}</p>
                    )}
                </div>
            </div>

            {/* Mahalle (Neighborhood) */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Mahalle {required && <span className="text-red-500">*</span>}
                </label>
                <div className="relative">
                    <select
                        value={value.mahalle}
                        onChange={handleNeighborhoodChange}
                        className={selectClassName(errors.mahalle)}
                        disabled={!value.ilce}
                        required={required}
                    >
                        <option value="">Mahalle Seçiniz</option>
                        {neighborhoods.map((neighborhood) => (
                            <option key={neighborhood} value={neighborhood}>
                                {neighborhood}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
                {errors.mahalle && (
                    <p className="mt-1 text-sm text-red-500">{errors.mahalle}</p>
                )}
            </div>

            {/* Street Address */}
            {showStreetAddress && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Sokak/Cadde ve Kapı No {required && <span className="text-red-500">*</span>}
                    </label>
                    <input
                        type="text"
                        value={value.adres}
                        onChange={handleAddressChange}
                        placeholder="Örn: Atatürk Cad. No: 123 Daire: 4"
                        className={`
              w-full px-4 py-3 rounded-xl border transition-all duration-200
              ${errors.adres
                                ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500'
                                : 'border-gray-200 hover:border-gray-300 focus:ring-primary-500/20 focus:border-primary-500'
                            }
              focus:outline-none focus:ring-2
            `}
                        required={required}
                    />
                    {errors.adres && (
                        <p className="mt-1 text-sm text-red-500">{errors.adres}</p>
                    )}
                </div>
            )}

            {/* Display Full Address */}
            {value.il && value.ilce && value.mahalle && (
                <div className="p-3 bg-primary-50 rounded-xl border border-primary-100">
                    <p className="text-sm text-primary-700">
                        <span className="font-medium">Seçilen Konum:</span>{' '}
                        {value.mahalle}, {value.ilce}/{value.il}
                    </p>
                </div>
            )}
        </div>
    );
};

export default AddressSelector;
