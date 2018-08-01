const fs = require('fs');
const path = require('path');
const execa = require('execa');
const mkdirp = require('mkdirp');
const builder = require('junit-report-builder');
const { fail, warn, markdown, danger } = require('danger');
const prettierVersion = require('prettier/package.json').version;
const eslintJUnitReporter = require('eslint/lib/formatters/junit');

const reportDir = './test-results/';

const fromRoot = p => path.relative('', p);
const reportFile = name => {
    const subdir = path.join(reportDir, name);
    mkdirp.sync(subdir);
    return path.join(subdir, 'results.xml');
};
const fence = '```';
const nsPerSec = 1e9;
const codeFence = str => `${fence}\n${str.trim()}\n${fence}`;

const timer = () => {
    const startTime = process.hrtime();
    return () => {
        const [seconds, nanoseconds] = process.hrtime(startTime);
        return (seconds + nanoseconds / nsPerSec).toFixed(1);
    };
};

function jUnitSuite(title) {
    const seconds = timer();
    const suite = builder
        .testSuite()
        .name(title)
        .timestamp(new Date());
    return {
        pass(name) {
            suite.testCase(name);
        },
        fail(name, message, trace) {
            const testCase = suite.testCase(name).failure(message);
            if (trace) {
                testCase.stackTrace(trace);
            }
        },
        error(name, message, trace) {
            const testCase = suite.testCase(name).error(message);
            if (trace) {
                testCase.standardError(trace);
            }
        },
        save(filename) {
            suite.time(seconds());
            builder.writeTo(reportFile('prettier'));
        }
    };
}

const tasks = [
    function prettierCheck() {
        const junit = jUnitSuite('Prettier');
        let stdout, stderr;
        try {
            const result = execa.sync('npm', [
                'run',
                '--silent',
                'prettier:check',
                '--',
                '--loglevel=debug'
            ]);
            stdout = result.stdout;
            stderr = result.stderr;
        } catch (err) {
            stdout = err.stdout;
            stderr = err.stderr;
        }
        const failedFiles = stdout.split('\n').filter(s => s.trim());
        // Prettier doesn't normally print the files it covered, but in debug
        // mode, you can extract them with these regex (as of Prettier 1.13.5)
        // This is a hack based on debug output not guaranteed to stay the same.
        const errorLineStartRE = /^\[error\]\s*/;
        const errors = stderr.match(/(\[error\].+?\n)+/gim);
        const errorMap = {};
        if (errors) {
            errors.forEach(block => {
                const lines = block.split('\n[error] ');
                const firstLine = lines.shift();
                if (errorLineStartRE.test(firstLine)) {
                    // parseable
                    const [name, message] = firstLine
                        .replace(errorLineStartRE, '')
                        .split(':')
                        .map(s => s.trim());
                    if (name && message) {
                        errorMap[name] = {
                            message,
                            trace: lines.join('\n')
                        };
                    }
                }
            });
        }
        const coveredFiles = stderr.match(
            /\[debug\]\s*resolve config from '[^']+'\n/gim
        );
        if (!coveredFiles || coveredFiles.length === 0) {
            let warning = 'Prettier did not appear to cover any files.';
            if (prettierVersion !== '1.13.5') {
                warning +=
                    '\nThis may be due to an unexpected change in debug output in a version of Prettier later than 1.13.5.';
            }
            warn(warning);
        }
        coveredFiles.forEach(line => {
            const filename = line.match(/'([^']+)'/)[1];
            if (errorMap[filename]) {
                junit.error(
                    filename,
                    errorMap[filename].message,
                    errorMap[filename].trace
                );
            } else if (failedFiles.includes(filename)) {
                junit.fail(filename, 'was not formatted with Prettier');
            } else {
                junit.pass(filename);
            }
        });
        junit.save('prettier-junit.xml');
        if (failedFiles.length > 0) {
            fail(
                'The following file(s) were not ' +
                    'formatted with **prettier**. Make sure to execute `npm run prettier` ' +
                    `locally prior to committing.\n${codeFence(stdout)}`
            );
        }
    },

    function eslintCheck() {
        const seconds = timer();
        let stdout;
        try {
            ({ stdout } = execa.sync('npm', [
                'run',
                '--silent',
                'lint',
                '--',
                '-f',
                'json'
            ]));
        } catch (err) {
            ({ stdout } = err);
        }
        const results = JSON.parse(stdout);
        // TODO: build as XML DOM so we can customize
        const eslintXml = eslintJUnitReporter(results);
        const eslintXmlWithTime = eslintXml.replace(
            /testsuite package="org\.eslint" time="0"/m,
            `testsuite package="org.eslint" time="${seconds()}"`
        );
        fs.writeFileSync(reportFile('eslint'), eslintXmlWithTime, 'utf8');

        const errFiles = results
            .filter(r => r.errorCount)
            //.map(r => fromRoot(r.filePath));
            .map(r => r.filePath);

        if (errFiles.length > 0) {
            fail(
                'The following file(s) did not pass **ESLint**. Execute ' +
                    '`npm run lint` locally for more details\n' +
                    codeFence(errFiles.join('\n'))
            );
        }
    },

    function unitTests() {
        let summary;
        try {
            summary = require('./test-results.json');
        } catch (e) {
            execa.sync('npm', ['run', '-s', 'test:ci']);
            summary = require('./test-results.json');
        }
        const failedTests = summary.testResults.filter(
            t => t.status !== 'passed'
        );
        if (failedTests.length === 0) {
            return;
        }
        // prettier-ignore
        const failSummary = failedTests.map(t =>
                `<details>
    <summary>${fromRoot(t.name)}</summary>
    <pre>${t.message}</pre>
    </details>`
            ).join('\n');
        fail(
            'The following unit tests did _not_ pass 😔. ' +
                'All tests must pass before this PR can be merged\n\n\n' +
                failSummary
        );
    }

    // function mergeJunitReports() {
    //     execa.sync('junit-merge', [
    //         '--dir',
    //         reportDir,
    //         '--out',
    //         reportFile('all-junit.xml')
    //     ]);
    // }

    // Disabled for now, but leaving in for future implementation.
    // Can't use right now due to the lack of permissions granularity
    // in GitHub
    // async function addProjectLabels() {
    //     const allChangedFiles = [
    //         ...danger.git.created_files,
    //         ...danger.git.deleted_files,
    //         ...danger.git.modified_files
    //     ];
    //     const touchedPackages = allChangedFiles.reduce((touched, path) => {
    //         const matches = path.match(/packages\/([\w-]+)\//);
    //         return matches ? touched.add(matches[1]) : touched;
    //     }, new Set());

    //     if (!touchedPackages.size) return;

    //     await danger.github.api.issues.addLabels(
    //         Object.assign({}, danger.github.thisPR, {
    //             labels: Array.from(touchedPackages).map(s => `pkg:${s}`)
    //         })
    //     );
    // }
];

(async () => {
    for (const task of tasks) await task();
})();
