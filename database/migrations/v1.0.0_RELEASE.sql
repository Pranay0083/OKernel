-- Release Migration: v1.0.0
-- Launches OKernel v1.0.0 and SysCore Engine 2

-- Update App Version
UPDATE app_config 
SET value = 'v1.0.0' 
WHERE key = 'app_version';

-- Update MOTD
UPDATE app_config 
SET value = 'Welcome to OKernel v1.0.0. Powered by SysCore Engine 2. Type "help" in Shell.' 
WHERE key = 'motd';

-- Ensure System Status is Online
UPDATE app_config 
SET value = 'ONLINE' 
WHERE key = 'system_status';
