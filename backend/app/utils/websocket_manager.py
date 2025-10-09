import json
import logging
from typing import Dict
from fastapi import WebSocket

logger = logging.getLogger(__name__)

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, client_id: str):
        await websocket.accept()
        self.active_connections[client_id] = websocket
        logger.info(f"WebSocket connected: {client_id}")

    def disconnect(self, client_id: str):
        if client_id in self.active_connections:
            del self.active_connections[client_id]
            logger.info(f"WebSocket disconnected: {client_id}")

    async def send_progress_update(self, client_id: str, status: Dict):
        if client_id in self.active_connections:
            try:
                await self.active_connections[client_id].send_text(json.dumps({
                    "type": "progress_update",
                    "data": status
                }))
            except Exception as e:
                logger.error(f"Error sending progress update to {client_id}: {e}")
                self.disconnect(client_id)

    async def send_completion(self, client_id: str, result: Dict):
        if client_id in self.active_connections:
            try:
                await self.active_connections[client_id].send_text(json.dumps({
                    "type": "processing_complete",
                    "data": result
                }))
            except Exception as e:
                logger.error(f"Error sending completion to {client_id}: {e}")

    async def send_error(self, client_id: str, error: str):
        if client_id in self.active_connections:
            try:
                await self.active_connections[client_id].send_text(json.dumps({
                    "type": "processing_error",
                    "data": {"error": error}
                }))
            except Exception as e:
                logger.error(f"Error sending error to {client_id}: {e}")

# Global instance
manager = ConnectionManager()