"""
Omega PC Remote Agent — runs on your Windows PC
Connects to the Relay Server and executes commands remotely.

Usage:
    python omega-pc-agent.py
"""

import asyncio
import json
import os
import platform
import subprocess
import sys
import signal

# ── CONFIG ──────────────────────────────────────────────────────────────
RELAY_URL = os.environ.get(
    "OMEGA_RELAY_URL",
    "wss://omega-relay.onrender.com"  # Change to your deployed Render URL
)
TOKEN = os.environ.get(
    "OMEGA_RELAY_TOKEN",
    "change-me-to-your-relay-token"
)
ALLOWED_DIRS = os.environ.get(
    "OMEGA_ALLOWED_DIRS",
    "C:\\Users\\pc,D:\\TERMINALCLI"
).split(",")
# ────────────────────────────────────────────────────────────────────────

VERSION = "1.0.0"
HOSTNAME = platform.node()
OS_NAME = f"{platform.system()} {platform.release()}"

import websockets
from websockets.exceptions import ConnectionClosed


async def execute_command(command: str, cwd: str | None = None) -> dict:
    """Run a shell command and return output."""
    try:
        proc = await asyncio.create_subprocess_shell(
            command,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
            cwd=cwd,
            shell=True,
        )
        stdout, stderr = await asyncio.wait_for(proc.communicate(), timeout=120)
        return {
            "stdout": stdout.decode("utf-8", errors="replace"),
            "stderr": stderr.decode("utf-8", errors="replace"),
            "exit_code": proc.returncode,
        }
    except asyncio.TimeoutError:
        proc.kill()
        return {"stdout": "", "stderr": "Command timed out (120s)", "exit_code": -1}
    except Exception as e:
        return {"stdout": "", "stderr": str(e), "exit_code": -1}


async def agent_loop():
    """Main agent loop — connects to relay and processes commands."""
    uri = f"{RELAY_URL}?role=agent&token={TOKEN}"
    print(f"Ω Omega PC Remote Agent v{VERSION}")
    print(f"  Host: {HOSTNAME}")
    print(f"  OS:   {OS_NAME}")
    print(f"  Relay: {RELAY_URL}")
    print(f"  Allow: {', '.join(ALLOWED_DIRS)}")
    print("  Connecting...")

    while True:
        try:
            async with websockets.connect(uri, ping_interval=30, ping_timeout=10) as ws:
                print("  ✓ Connected to relay server\n")

                # Send identity
                await ws.send(json.dumps({
                    "type": "identity",
                    "hostname": HOSTNAME,
                    "os": OS_NAME,
                    "version": VERSION,
                    "allowed_dirs": ALLOWED_DIRS,
                }))

                async for raw in ws:
                    try:
                        msg = json.loads(raw)
                    except json.JSONDecodeError:
                        continue

                    cmd_type = msg.get("type")

                    if cmd_type == "exec":
                        cmd_id = msg.get("id", "0")
                        command = msg.get("command", "")
                        cwd = msg.get("cwd")

                        # Security: restrict cwd to allowed dirs
                        if cwd:
                            allowed = False
                            for d in ALLOWED_DIRS:
                                if cwd.startswith(d):
                                    allowed = True
                                    break
                            if not allowed:
                                await ws.send(json.dumps({
                                    "type": "output",
                                    "id": cmd_id,
                                    "stdout": "",
                                    "stderr": f"Access denied: {cwd} is not in allowed directories",
                                    "exit_code": 1,
                                }))
                                continue

                        print(f"  ▶ exec[{cmd_id}]: {command[:80]}...")
                        result = await execute_command(command, cwd)
                        await ws.send(json.dumps({
                            "type": "output",
                            "id": cmd_id,
                            **result,
                        }))

                    elif cmd_type == "ping":
                        await ws.send(json.dumps({"type": "pong"}))

                    elif cmd_type == "list_dir":
                        cmd_id = msg.get("id", "0")
                        path = msg.get("path", ".")
                        try:
                            items = os.listdir(path)
                            await ws.send(json.dumps({
                                "type": "dir_list",
                                "id": cmd_id,
                                "path": path,
                                "items": items,
                            }))
                        except Exception as e:
                            await ws.send(json.dumps({
                                "type": "dir_list",
                                "id": cmd_id,
                                "path": path,
                                "error": str(e),
                            }))

        except ConnectionClosed:
            print("  ! Disconnected. Reconnecting in 5s...")
            await asyncio.sleep(5)
        except Exception as e:
            print(f"  ✗ Error: {e}")
            print("  Retrying in 10s...")
            await asyncio.sleep(10)


def main():
    try:
        asyncio.run(agent_loop())
    except KeyboardInterrupt:
        print("\n  Agent stopped.")
        sys.exit(0)


if __name__ == "__main__":
    main()
