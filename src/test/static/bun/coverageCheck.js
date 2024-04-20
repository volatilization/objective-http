const testRunnerResult = Bun.spawnSync(["bun", "run", "bunTest"]);
console.log(testRunnerResult.stderr.toString());

const codeCoverageResultTableHeaderLine = testRunnerResult.stderr.toString()
    .split('\n')
    .filter(line => line.includes('Funcs'))
    .filter(line => line.includes('Funcs'))
    .filter(line => line.includes('Lines'))
    .filter(line => line.includes('Uncovered Line'))
    .findLast(line => line.length > 0);

if (codeCoverageResultTableHeaderLine == null) {
    console.error('no code coverage result');
    process.exit(2);
}

const coveragePercent = testRunnerResult.stderr.toString()
    .split(codeCoverageResultTableHeaderLine)[1]
    .split('\n')
    .filter(line => line.includes('.js'))
    .filter(line => line.includes('/bun/'))
    .filter(line => !line.includes('/test/'))
    .map(line => Number(line.split('|')[2].trim()))
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
