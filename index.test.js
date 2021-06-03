const run = require('.');
const core = require('@actions/core');
const tmp = require('tmp');
const fs = require('fs');

jest.mock('@actions/core');
jest.mock('tmp');
jest.mock('fs');

describe('Render job definition', () => {

    beforeEach(() => {
        jest.clearAllMocks();

        core.getInput = jest
            .fn()
            .mockReturnValueOnce('job-definition.json') // job-definition
            .mockReturnValueOnce('nginx:latest');        // image

        process.env = Object.assign(process.env, { GITHUB_WORKSPACE: __dirname });
        process.env = Object.assign(process.env, { RUNNER_TEMP: '/home/runner/work/_temp' });

        tmp.fileSync.mockReturnValue({
            name: 'new-job-def-file-name'
        });

        fs.existsSync.mockReturnValue(true);

        jest.mock('./job-definition.json', () => ({
            type: 'container',
            containerProperties: {
                image: "some-other-image"
            }
        }),
            { virtual: true });
    });

    test('renders the job definition and creates a new job def file', async () => {
        await run();
        expect(tmp.fileSync).toHaveBeenNthCalledWith(1, {
            tmpdir: '/home/runner/work/_temp',
            prefix: 'job-definition-',
            postfix: '.json',
            keep: true,
            discardDescriptor: true
        });
        expect(fs.writeFileSync).toHaveBeenNthCalledWith(1, 'new-job-def-file-name',
            JSON.stringify({
                type: 'container',
                containerProperties: {
                    image: "nginx:latest"
                }
            }, null, 2)
        );
        expect(core.setOutput).toHaveBeenNthCalledWith(1, 'job-definition', 'new-job-def-file-name');
    });

    test('renders a job definition at an absolute path', async () => {
        core.getInput = jest
            .fn()
            .mockReturnValueOnce('/hello/job-definition.json') // job-definition
            .mockReturnValueOnce('nginx:latest');        // image
        jest.mock('/hello/job-definition.json', () => ({
            type: 'container',
            containerProperties: {
                image: "some-other-image"
            }
        }), { virtual: true });

        await run();

        expect(tmp.fileSync).toHaveBeenNthCalledWith(1, {
            tmpdir: '/home/runner/work/_temp',
            prefix: 'job-definition-',
            postfix: '.json',
            keep: true,
            discardDescriptor: true
        });
        expect(fs.writeFileSync).toHaveBeenNthCalledWith(1, 'new-job-def-file-name',
            JSON.stringify({
                type: 'container',
                containerProperties: {
                    image: "nginx:latest"
                }
            }, null, 2)
        );
        expect(core.setOutput).toHaveBeenNthCalledWith(1, 'job-definition', 'new-job-def-file-name');
    });

    test('error returned for missing job definition file', async () => {
        fs.existsSync.mockReturnValue(false);
        core.getInput = jest
            .fn()
            .mockReturnValueOnce('does-not-exist-job-definition.json')
            .mockReturnValueOnce('nginx:latest');

        await run();

        expect(core.setFailed).toBeCalledWith('job definition file does not exist: does-not-exist-job-definition.json');
    });

    test('error returned for job definition without contaier props', async () => {
        jest.mock('./missing-container-job-definition.json', () => ({
            type: 'container',
        }), { virtual: true });

        core.getInput = jest
            .fn()
            .mockReturnValueOnce('missing-container-job-definition.json')
            .mockReturnValueOnce('nginx:latest');

        await run();

        expect(core.setFailed).toBeCalledWith('Invalid job definition: Could not find container properties');
    });
});
