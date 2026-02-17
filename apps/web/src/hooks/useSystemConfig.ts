
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { APP_VERSION } from '../version';

interface SystemConfig {
    version: string;
    status: string;
    motd: string;
}

export const useSystemConfig = () => {
    const [config, setConfig] = useState<SystemConfig>({
        version: `v${APP_VERSION}`, // Fallback
        status: 'ONLINE',
        motd: `SysCore v${APP_VERSION} Stable`
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
                    version: configMap['app_version'] || `v${APP_VERSION}`,
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
