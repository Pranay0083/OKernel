
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface SystemConfig {
    version: string;
    status: string;
    motd: string;
}

export const useSystemConfig = () => {
    const [config, setConfig] = useState<SystemConfig>({
        version: 'v1.1.0', // Fallback
        status: 'ONLINE',
        motd: 'SysCore v1.1.0 Stable'
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchConfig = async () => {
            const { data, error: _error } = await supabase
                .from('app_config')
                .select('*');

            if (data) {
                const configMap: Record<string, string> = {};
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
