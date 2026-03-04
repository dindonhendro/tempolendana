const fs = require('fs');
const https = require('https');
const path = require('path');

const bniUrl = "https://upload.wikimedia.org/wikipedia/id/5/55/BNI_logo.svg"; // Let's try SVG as it is the most stable
const nanoUrl = "https://upload.wikimedia.org/wikipedia/commons/e/e0/NanoBanksyariah-Logo.png";

const publicDir = path.join(__dirname, 'public', 'images', 'banks');

if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
}

function download(url, filename) {
    return new Promise((resolve, reject) => {
        const filePath = path.join(publicDir, filename);
        const file = fs.createWriteStream(filePath);
        const options = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        };
        https.get(url, options, (response) => {
            if (response.statusCode === 301 || response.statusCode === 302) {
                // handle redirect if any
                https.get(response.headers.location, options, (res2) => {
                    res2.pipe(file);
                    file.on('finish', () => { file.close(); resolve(); });
                });
                return;
            }
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to get '${url}' (${response.statusCode})`));
                return;
            }
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                console.log(`Downloaded ${filename} successfully.`);
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(filePath, () => reject(err));
        });
    });
}

(async () => {
    try {
        await download(bniUrl, 'bni.svg');
        await download(nanoUrl, 'nanobank.png');
        console.log("Logos downloaded to public/images/banks/");
    } catch (err) {
        console.log("Error. Trying alternative for BNI...");
        try {
            await download("https://img.logokit.com/bni.co.id", "bni.png");
            await download(nanoUrl, 'nanobank.png');
            console.log("Logos downloaded via alternative.");
        } catch (e2) {
            console.error("Critical failure downloading logos:", e2);
        }
    }
})();
