import { useState, useEffect, useRef } from 'react';
import { locationApi } from '../api/location';

// Helper to normalize strings for comparison
const normalize = (str) => {
    if (!str) return "";
    return str
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove accents
        .replace(/đ/g, "d")
        .replace(/^(tinh|thanh pho|tp\.?|t\.?)\s+/g, "")
        .replace(/^(quan|huyen|thi xa|tx\.?|h\.?)\s+/g, "")
        .replace(/^(phuong|xa|thi tran|tt\.?|p\.?|x\.?)\s+/g, "")
        .replace(/\s+/g, " ")
        .trim();
};

export const useLocation = (initialAddress) => {
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);

    const [selectedCity, setSelectedCity] = useState(null);
    const [selectedDistrict, setSelectedDistrict] = useState(null);
    const [selectedWard, setSelectedWard] = useState(null);

    // Auto-init tracking
    const isAutoInit = useRef(false);
    const prevAddressRef = useRef(initialAddress);

    // Reset loop
    useEffect(() => {
        const prev = prevAddressRef.current;
        const curr = initialAddress;

        const hasChanged =
            curr?.city !== prev?.city ||
            curr?.district !== prev?.district ||
            curr?.ward !== prev?.ward;

        if (hasChanged || (curr && !isAutoInit.current && !selectedCity)) {
            isAutoInit.current = true;
            setSelectedCity(null);
            setSelectedDistrict(null);
            setSelectedWard(null);
            prevAddressRef.current = curr;
        }
    }, [initialAddress, selectedCity]);

    // Load Provinces
    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                const data = await locationApi.getProvinces();
                if (Array.isArray(data)) {
                    setProvinces(data.map(p => ({ label: p.name, value: p.code, raw: p })));
                }
            } catch (e) {
                console.error(e);
            }
        };
        fetchProvinces();
    }, []);

    // 1. Match City
    useEffect(() => {
        if (isAutoInit.current && provinces.length > 0 && initialAddress?.city && !selectedCity) {
            const normInit = normalize(initialAddress.city);
            const found = provinces.find(p => {
                const normP = normalize(p.label);
                return normP === normInit || p.label.toLowerCase().includes(initialAddress.city.toLowerCase()) || initialAddress.city.toLowerCase().includes(p.label.toLowerCase());
            });

            if (found) {
                setSelectedCity({ code: found.value, name: found.label });
            } else {
                isAutoInit.current = false;
            }
        }
    }, [provinces, initialAddress, selectedCity]);

    // 2. Fetch Districts & Match District
    useEffect(() => {
        if (selectedCity?.code) {
            console.log("Fetching districts for city code:", selectedCity.code); // Log 1
            let active = true;
            const fetchDistricts = async () => {
                try {
                    const data = await locationApi.getDistricts(selectedCity.code);
                    if (!active) return;
                    console.log("Districts API response:", data); // Log 2

                    if (data && data.districts) {
                        const opts = data.districts.map(d => ({ label: d.name, value: d.code, raw: d }));
                        console.log("Parsed district options:", opts); // Log 3
                        setDistricts(opts);

                        // Match District
                        if (isAutoInit.current && initialAddress?.district && !selectedDistrict) {
                            const normInit = normalize(initialAddress.district);
                            const found = opts.find(d => {
                                const normD = normalize(d.label);
                                return normD === normInit || d.label.toLowerCase().includes(initialAddress.district.toLowerCase()) || initialAddress.district.toLowerCase().includes(d.label.toLowerCase());
                            });
                            if (found) {
                                setSelectedDistrict({ code: found.value, name: found.label });
                            } else {
                                isAutoInit.current = false;
                            }
                        } else if (isAutoInit.current && !initialAddress?.district) {
                            isAutoInit.current = false;
                        }
                    } else {
                        console.warn("No districts found in API response");
                        setDistricts([]);
                        if (isAutoInit.current) isAutoInit.current = false;
                    }
                } catch (e) {
                    console.error("Error fetching districts:", e);
                }
            };
            fetchDistricts();
            return () => { active = false; };
        } else {
            console.log("No selected city, clearing districts");
            setDistricts([]);
        }
    }, [selectedCity?.code, initialAddress]);

    // 3. Fetch Wards & Match Ward
    useEffect(() => {
        if (selectedDistrict?.code) {
            let active = true;
            const fetchWards = async () => {
                try {
                    const data = await locationApi.getWards(selectedDistrict.code);
                    if (!active) return;

                    if (data && data.wards) {
                        const opts = data.wards.map(w => ({ label: w.name, value: w.code, raw: w }));
                        setWards(opts);

                        // Match Ward
                        if (isAutoInit.current && initialAddress?.ward && !selectedWard) {
                            const normInit = normalize(initialAddress.ward);
                            const found = opts.find(w => {
                                const normW = normalize(w.label);
                                return normW === normInit || w.label.toLowerCase().includes(initialAddress.ward.toLowerCase()) || initialAddress.ward.toLowerCase().includes(w.label.toLowerCase());
                            });
                            if (found) {
                                setSelectedWard({ code: found.value, name: found.label });
                            }
                            isAutoInit.current = false;
                        } else if (isAutoInit.current) {
                            isAutoInit.current = false;
                        }
                    } else {
                        setWards([]);
                        if (isAutoInit.current) isAutoInit.current = false;
                    }
                } catch (e) {
                    console.error(e);
                }
            };
            fetchWards();
            return () => { active = false; };
        } else {
            setWards([]);
        }
    }, [selectedDistrict?.code, initialAddress]);

    const setCity = (code) => {
        isAutoInit.current = false;
        const p = provinces.find(opt => opt.value === code);
        setSelectedCity(p ? { code: p.value, name: p.label } : null);
        setSelectedDistrict(null);
        setSelectedWard(null);
        setDistricts([]);
        setWards([]);
    };

    const setDistrict = (code) => {
        isAutoInit.current = false;
        const d = districts.find(opt => opt.value === code);
        setSelectedDistrict(d ? { code: d.value, name: d.label } : null);
        setSelectedWard(null);
        setWards([]);
    };

    const setWard = (code) => {
        isAutoInit.current = false;
        const w = wards.find(opt => opt.value === code);
        setSelectedWard(w ? { code: w.value, name: w.label } : null);
    };

    return {
        provinces, districts, wards,
        selectedCity, selectedDistrict, selectedWard,
        setCity, setDistrict, setWard
    };
};
