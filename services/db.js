let serviceClientPromise;

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

async function getServiceRoleClient() {
  if (!serviceClientPromise) {
    serviceClientPromise = (async () => {
      const { createClient } = await import("@supabase/supabase-js");
      return createClient(
        requireEnv("SUPABASE_URL"),
        requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
        {
          auth: {
            persistSession: false,
            autoRefreshToken: false
          }
        }
      );
    })();
  }

  return serviceClientPromise;
}

module.exports = {
  getServiceRoleClient,
  requireEnv
};
