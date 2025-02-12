const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'users.json');


const readUsers = async () => {
    try {
        const data = await fs.promises.readFile(DATA_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        
        if (error.code === 'ENOENT') {
            return [];
        }
        throw error;
    }
};

const writeUsers = async (users) => {
    await fs.promises.writeFile(DATA_FILE, JSON.stringify(users, null, 2));
};


const server = http.createServer(async (req, res) => {
    const { method, url } = req;

    if (url === '/users' && method === 'GET') {
       
        try {
            const users = await readUsers();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(users));
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Failed to read user data' }));
        }
    } else if (url === '/users' && method === 'POST') {
       
        let body = '';
        req.on('data', (chunk) => (body += chunk));
        req.on('end', async () => {
            try {
                const newUser = JSON.parse(body);
                const users = await readUsers();
                newUser.id = users.length > 0 ? users[users.length - 1].id + 1 : 1; // Assign an incremental ID
                users.push(newUser);
                await writeUsers(users);

                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'User added successfully', user: newUser }));
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid user data' }));
            }
        });
    } else if (url.startsWith('/users/') && method === 'DELETE') {
        
        const userId = parseInt(url.split('/')[2], 10);

        if (isNaN(userId)) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid user ID' }));
            return;
        }

        try {
            const users = await readUsers();
            const filteredUsers = users.filter((user) => user.id !== userId);

            if (users.length === filteredUsers.length) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'User not found' }));
            } else {
                await writeUsers(filteredUsers);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: `User with ID ${userId} deleted successfully` }));
            }
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Failed to delete user' }));
        }
    } else {
      
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Route not found' }));
    }   
});


server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
