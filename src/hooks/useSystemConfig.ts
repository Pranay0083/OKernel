
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface SystemConfig {
    version: string;
    status: string;
    motd: string;
}

export const useSystemConfig = () => {
    const [config, setConfig] = useState<SystemConfig>({
        version: 'v0.4.0', // Fallback
        status: 'ONLINE',
        motd: ''
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchConfig = async () => {
            const { data, error } = await supabase
                .from('app_config')
                .select('*');

            if (data) {
                const configMap: any = {};
                data.forEach(item => {
                    configMap[item.key] = item.value;
                });

                setConfig({
                    version: configMap['app_version'] || 'v0.4.0',
                    status: configMap['system_status'] || 'ONLINE',
                    motd: configMap['motd'] || ''
                });
            }
            setLoading(false);
        };

        fetchConfig();
    }, []);

    return { config, loading };
};
