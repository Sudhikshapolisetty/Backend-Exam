const http = require('http');
const fs = require('fs');
const url = require('url');


const PORT = process.env.PORT || 8080;


const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const query = parsedUrl.query;
    console.log(`[${new Date().toISOString()}] ${req.method} ${pathname}`);
    if (req.method === 'POST' && pathname === '/createFile') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            const { filename, content } = JSON.parse(body);
            if (!filename || !content) {
                res.writeHead(400, {'Content-Type': 'text/plain'});
                res.end('Both filename and content are required.');
            } else {
                fs.writeFile(filename, content, (err) => {
                    if (err) {
                        console.error(err);
                        res.writeHead(500, {'Content-Type': 'text/plain'});
                        res.end('Failed to create or modify the file.');
                    } else {
                        res.writeHead(200, {'Content-Type': 'text/plain'});
                        res.end('File created or modified successfully.');
                    }
                });
            }
        });
    } else if (req.method === 'GET') {
        if (pathname === '/getFiles') {
            fs.readdir('.', (err, files) => {
                if (err) {
                    console.error(err);
                    res.writeHead(500, {'Content-Type': 'text/plain'});
                    res.end('Failed to retrieve the list of files.');
                } else {
                    res.writeHead(200, {'Content-Type': 'application/json'});
                    res.end(JSON.stringify(files));
                }
            });
        } else if (pathname === '/getFile') {
            const filename = query.filename;
            if (!filename) {
                res.writeHead(400, {'Content-Type': 'text/plain'});
                res.end('Filename is required.');
            } else {
                fs.readFile(filename, 'utf8', (err, data) => {
                    if (err) {
                        console.error(err);
                        res.writeHead(400, {'Content-Type': 'text/plain'});
                        res.end('File not found.');
                    } else {
                        res.writeHead(200, {'Content-Type': 'text/plain'});
                        res.end(data);
                    }
                });
            }
        }
    } else {
        res.writeHead(404, {'Content-Type': 'text/plain'});
        res.end('Page not found.');
    }
});
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
