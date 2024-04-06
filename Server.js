const http = require('http');
const fs = require('fs');
const url = require('url');

const PORT_NUMBER = process.env.PORT_NUMBER || 8080;

const server = http.createServer((request, response) => {
    const parsedUrl = url.parse(request.url, true);
    const path = parsedUrl.pathname;
    const query = parsedUrl.query;
    console.log(`[${new Date().toISOString()}] ${request.method} ${path}`);
    if (request.method === 'POST' && path === '/createFile') {
        let requestBody = '';
        request.on('data', chunk => {
            requestBody += chunk.toString();
        });
        request.on('end', () => {
            const { filename, content } = JSON.parse(requestBody);
            if (!filename || !content) {
                response.writeHead(400, {'Content-Type': 'text/plain'});
                response.end('Both filename and content are required.');
            } else {
                fs.writeFile(filename, content, (err) => {
                    if (err) {
                        console.error(err);
                        response.writeHead(500, {'Content-Type': 'text/plain'});
                        response.end('Failed to create or modify the file.');
                    } else {
                        response.writeHead(200, {'Content-Type': 'text/plain'});
                        response.end('File created or modified successfully.');
                    }
                });
            }
        });
    } else if (request.method === 'GET') {
        if (path === '/getFiles') {
            fs.readdir('.', (err, files) => {
                if (err) {
                    console.error(err);
                    response.writeHead(500, {'Content-Type': 'text/plain'});
                    response.end('Failed to retrieve the list of files.');
                } else {
                    response.writeHead(200, {'Content-Type': 'application/json'});
                    response.end(JSON.stringify(files));
                }
            });
        } else if (path === '/getFile') {
            const filename = query.filename;
            if (!filename) {
                response.writeHead(400, {'Content-Type': 'text/plain'});
                response.end('Filename is required.');
            } else {
                fs.readFile(filename, 'utf8', (err, data) => {
                    if (err) {
                        console.error(err);
                        response.writeHead(400, {'Content-Type': 'text/plain'});
                        response.end('File not found.');
                    } else {
                        response.writeHead(200, {'Content-Type': 'text/plain'});
                        response.end(data);
                    }
                });
            }
        }
    } else {
        response.writeHead(404, {'Content-Type': 'text/plain'});
        response.end('Page not found.');
    }
});
server.listen(PORT_NUMBER, () => {
    console.log(`Server is running on port ${PORT_NUMBER}`);
});
