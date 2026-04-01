const { requireEnv } = require("./db");

function normalizePrivateKey(privateKey) {
  return privateKey.includes("\\n") ? privateKey.replace(/\\n/g, "\n") : privateKey;
}

function createGitHubApp({ App, Octokit }) {
  return new App({
    appId: requireEnv("GITHUB_APP_ID"),
    privateKey: normalizePrivateKey(requireEnv("GITHUB_PRIVATE_KEY")),
    Octokit
  });
}

async function getInstallationOctokit(installationId) {
  try {
    const [{ App }, { Octokit }] = await Promise.all([
      import("@octokit/app"),
      import("@octokit/rest")
    ]);

    const app = createGitHubApp({ App, Octokit });
    return await app.getInstallationOctokit(Number(installationId));
  } catch (error) {
    throw new Error(`Failed to create installation client: ${error.message}`);
  }
}

async function sleep(ms) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function paginateWithDelay(octokit, route, parameters, delayMs = 100) {
  try {
    const results = [];
    let page = 1;

    while (true) {
      const response = await octokit.request(route, {
        ...parameters,
        per_page: 100,
        page
      });

      const items = response.data?.repositories || response.data?.workflow_runs || response.data?.jobs || response.data || [];
      if (!Array.isArray(items) || items.length === 0) {
        break;
      }

      results.push(...items);

      if (items.length < 100) {
        break;
      }

      page += 1;
      await sleep(delayMs);
    }

    return results;
  } catch (error) {
    throw new Error(`GitHub pagination failed for ${route}: ${error.message}`);
  }
}

module.exports = {
  getInstallationOctokit,
  paginateWithDelay,
  sleep
};
