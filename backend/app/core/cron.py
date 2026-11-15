import asyncio
import logging
import os
import httpx

logger = logging.getLogger("freshbasket.cron")

async def start_keep_alive_job():
    """
    Every 14 minutes, sends a GET request to the /health endpoint to prevent
    Render free tier from spinning down due to inactivity.
    Automatically detects Render's RENDER_EXTERNAL_URL or custom BACKEND_URL / PING_URL.
    """
    # Wait 10 seconds after server startup before checking config
    await asyncio.sleep(10)

    url = (
        os.getenv("RENDER_EXTERNAL_URL")
        or os.getenv("BACKEND_URL")
        or os.getenv("PING_URL")
    )

    if not url:
        logger.info(
            "Render keep-alive cron job idle: neither RENDER_EXTERNAL_URL, "
            "BACKEND_URL, nor PING_URL is set."
        )
        return

    health_url = f"{url.rstrip('/')}/health"
    logger.info(f"Keep-alive cron job active: pinging {health_url} every 14 minutes.")

    while True:
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                res = await client.get(health_url)
                if res.status_code == 200:
                    logger.info("Keep-alive GET request sent successfully (status: 200)")
                else:
                    logger.warning(f"Keep-alive GET request failed (status: {res.status_code})")
        except asyncio.CancelledError:
            logger.info("Keep-alive cron job cancelled.")
            break
        except Exception as e:
            logger.error(f"Error while sending keep-alive request: {e}")

        # Wait 14 minutes (840 seconds)
        try:
            await asyncio.sleep(14 * 60)
        except asyncio.CancelledError:
            logger.info("Keep-alive cron job stopped.")
            break
