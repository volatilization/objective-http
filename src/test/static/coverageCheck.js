const execSync = require('child_process').execSync;

const testResult = execSync('npm run test').toString();
console.log(testResult);

const coveragePercent = testResult
    .split('start of coverage report')[1]
    .split('end of coverage report')[0]
    .split('\n')
    .filter(line => line.includes('.js'))
    .filter(line => !line.includes('/bun/'))
    .filter(line => !line.includes('/test/'))
    .map(line => Number(line.split('|')[1].trim()))
    .reduce((prevPercent, currPercent, currIndex, array) => {
        if (currIndex === 0) {
            return currPercent;
        }
        if (currIndex === (array.length - 1)) {
            return (prevPercent + currPercent) / array.length;
        }
        return prevPercent + currPercent;
    });

if (coveragePercent < Number(process.env.COVERAGE_MIN_PERCENT)) {
    console.error(`${coveragePercent} is not enough coverage percent`);
    process.exit(1);
}

console.log(`${coveragePercent} is enough coverage percent`);
process.exit(0);

