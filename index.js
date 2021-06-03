const path = require('path');
const core = require('@actions/core');
const tmp = require('tmp');
const fs = require('fs');

async function run() {
  try {
    // Get inputs
    const jobDefinitionFile = core.getInput('job-definition', { required: true });
    const imageURI = core.getInput('image', { required: true });

    // Parse the task definition
    const jobDefPath = path.isAbsolute(jobDefinitionFile) ?
      jobDefinitionFile :
      path.join(process.env.GITHUB_WORKSPACE, jobDefinitionFile);
    if (!fs.existsSync(jobDefPath)) {
      throw new Error(`Task definition file does not exist: ${jobDefinitionFile}`);
    }
    const jobDefContents = require(jobDefPath);

    // Insert the image URI
    const containerProp = jobDefContents.containerProperties;
    if (!containerProp) {
      throw new Error('Invalid job definition: Could not find container properties');
    }
    containerProp.image = imageURI;

    // Write out a new task definition file
    var updatedjobDefFile = tmp.fileSync({
      tmpdir: process.env.RUNNER_TEMP,
      prefix: 'job-definition-',
      postfix: '.json',
      keep: true,
      discardDescriptor: true
    });
    const newJobDefContents = JSON.stringify(jobDefContents, null, 2);
    fs.writeFileSync(updatedjobDefFile.name, newJobDefContents);
    core.setOutput('job-definition', updatedjobDefFile.name);
  }
  catch (error) {
    core.setFailed(error.message);
  }
}

module.exports = run;

/* istanbul ignore next */
if (require.main === module) {
  run();
}
