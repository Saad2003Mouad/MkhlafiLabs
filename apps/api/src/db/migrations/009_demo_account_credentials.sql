-- MIKHLAFI LABS — 009_demo_account_credentials.sql
--
-- Sets known, documented passwords for the two permanent demonstration
-- accounts so the platform owner and a customer can always sign in to this
-- environment. The accounts themselves are created by 004_seed_executive_demo.
--
--   Platform operator console  https://<host>/admin
--     saad@mikhlafi-labs.com        / Mikhlafi@2026
--     owner@mikhlafi-labs.com       / Mikhlafi@2026   (alias of the same owner)
--
--   Customer workspace         https://<host>/app
--     client@mikhlafi-holding.com   / Client@2026
--
-- Hashes are scrypt ($scrypt$salt$key, 16-byte salt, 64-byte key) exactly as
-- produced by apps/api/src/auth/passwords.js. This migration runs once.

UPDATE users
SET password_hash = 'scrypt$a1ef98b0bf2178a41f2ab02ee6d22486$2d9f2d17ec310426baa0626a729fd44edd49e412f0199784368dd31017f21e67e9db33e298af1820301404f29fcb25c3337b6869211bc63f4c9e4ff56237b968',
    status = 'active',
    is_verified = true
WHERE email IN ('saad@mikhlafi-labs.com', 'owner@mikhlafi-labs.com');

UPDATE users
SET password_hash = 'scrypt$f4cbeede34fc7ee98bb4e099e6f24155$259460c063afc2d062e28bbe451ef5d498e938d8f9d7d3e60b54dcdb0a59f69603a4422dc6f666268ab6d31fdb2abada0a7711742426665b00cd2fabf8c3e25e',
    status = 'active',
    is_verified = true
WHERE email = 'client@mikhlafi-holding.com';
