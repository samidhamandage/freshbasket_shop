import { Server as NetServer } from 'http';
import { NextApiRequest } from 'next';
import { Server as ServerIO } from 'socket.io';
import { NextApiResponse } from 'next';

export const config = {
    api: {
        bodyParser: false,
    },
};

export default function SocketHandler(req: NextApiRequest, res: NextApiResponse) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!(res.socket as any).server.io) {
        console.log('*First use, starting socket.io');

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const httpServer: NetServer = (res.socket as any).server as any;
        const io = new ServerIO(httpServer, {
            path: '/api/socket',
        });

        io.on('connection', (socket) => {
            console.log('Socket connected', socket.id);

            // Join a room for a specific order
            socket.on('join_order', (orderId: string) => {
                socket.join(`order_${orderId}`);
                console.log(`Socket ${socket.id} joined order_${orderId}`);
            });

            // Admin joining
            socket.on('join_admin', () => {
                socket.join('admin');
                console.log(`Socket ${socket.id} joined admin`);
            });

            socket.on('disconnect', () => {
                console.log('Socket disconnected', socket.id);
            });
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (res.socket as any).server.io = io;
    } else {
        console.log('socket.io already running');
    }
    res.end();
}
