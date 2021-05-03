const got = require('got');

var fs = require('fs')
const stream = require('stream');
const { promisify } = require('util');
const pipeline = promisify(stream.pipeline);

exports.downloadFileGot = async (name, link, folder = './downloads', consoleNewLine = true, showProgress = true) => {
    try {
        if (!fs.existsSync(folder)){
            fs.mkdirSync(folder);
        }

        const downloadStream = got.stream(link);
        const fileStream = fs.createWriteStream(`${folder}/${name}`);

        var lastPercentageUsed = -1;
        downloadStream.on('downloadProgress', ({ transferred, total, percent }) => {
        const percentage = Math.round(percent * 100);
        if(showProgress &&
            (total !== 0 && total !== undefined) &&
            percentage !== lastPercentageUsed) {
            lastPercentageUsed = percentage;
            process.stdout.write(`[PROGRESS | ${transferred}/${total} (${percentage}%)]${(consoleNewLine ? '\n' : '')}`);
        }
        }).on('error', (error) => {
            process.stdout.write(`[FALHA!] (${error.message})${(consoleNewLine ? '\n' : '')}`);
        });

        fileStream.on('finish', () => {
            process.stdout.write(`[SUCESSO!]${(consoleNewLine ? '\n' : '')}`);
        });

        await pipeline(downloadStream, fileStream);
        //await downloadStream.pipe(fileStream);
    } catch (error) {
        //IMPORTANT: Handle a possible error. An error is thrown in case of network errors, or status codes of 400 and above.
        //Note that if the maxAttempts is set to higher than 1, the error is thrown only if all attempts fail.
        process.stdout.write(`[FALHA!] (${error}) ${(consoleNewLine ? '\n' : '')}`);
    }
};