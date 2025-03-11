from urllib.parse import parse_qs

class WebSocketCORSMiddleware:
    """
    Custom middleware for handling CORS on WebSocket connections.
    """

    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        # Handle WebSocket CORS
        if scope["type"] == "websocket":
            # Extract the origin header
            headers = dict(scope.get("headers", []))
            origin = headers.get(b"origin", b"").decode("latin1")

            # Log information for debugging
            print(f"WebSocket connection attempt from: {origin}")

            # We could check if origin is in allowed origins here
            # But for development, we'll allow all origins

            # Pass to next middleware or consumer
            return await self.app(scope, receive, send)

        # For non-WebSocket connections, pass through
        return await self.app(scope, receive, send)


class TokenAuthMiddleware:
    """
    Custom middleware that extracts token from WebSocket URL query parameters.
    """

    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        

          return await self.inner(scope, receive, send)