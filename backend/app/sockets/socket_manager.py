import logging
import socketio
from typing import Any

logger = logging.getLogger("freshbasket.socketio")

sio = socketio.AsyncServer(
    async_mode="asgi",
    cors_allowed_origins="*"
)

socket_app = socketio.ASGIApp(
    socketio_server=sio,
    socketio_path="socket"
)

@sio.event
async def connect(sid, environ):
    logger.info(f"Socket.IO client connected: {sid}")

@sio.event
async def disconnect(sid):
    logger.info(f"Socket.IO client disconnected: {sid}")

@sio.event
async def join_order(sid, order_id: str):
    room = f"order_{order_id}"
    await sio.enter_room(sid, room)
    logger.info(f"Socket {sid} joined room {room}")

@sio.event
async def join_admin(sid):
    await sio.enter_room(sid, "admin")
    logger.info(f"Socket {sid} joined room admin")

async def emit_order_updated(order_data: dict):
    order_id = order_data.get("id")
    if order_id:
        room = f"order_{order_id}"
        await sio.emit("order_updated", order_data, room=room)
        await sio.emit("order_updated", order_data, room="admin")
        logger.info(f"Emitted order_updated for order {order_id} to rooms {room} and admin")

