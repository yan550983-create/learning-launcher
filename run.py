#!/usr/bin/env python3
"""One-click local launcher for Focus Reading Launcher.

Run with:
    python3 run.py

The script starts a tiny local static server and opens the web app in the
browser. It does not upload data or start any backend API.
"""

from __future__ import annotations

import argparse
import contextlib
import functools
import http.server
import socket
import socketserver
import sys
import threading
import time
import webbrowser
from pathlib import Path

APP_PATH = "web/index.html"
DEFAULT_HOST = "127.0.0.1"
DEFAULT_PORT = 8000


class QuietStaticHandler(http.server.SimpleHTTPRequestHandler):
    """Static-file handler with concise console logs."""

    def log_message(self, format: str, *args: object) -> None:  # noqa: A002 - inherited API name
        sys.stdout.write("[Focus Reading Launcher] " + (format % args) + "\n")


def port_is_free(host: str, port: int) -> bool:
    with contextlib.closing(socket.socket(socket.AF_INET, socket.SOCK_STREAM)) as sock:
        sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        try:
            sock.bind((host, port))
        except OSError:
            return False
        return True


def choose_port(host: str, requested_port: int) -> int:
    for port in range(requested_port, requested_port + 50):
        if port_is_free(host, port):
            return port
    raise RuntimeError(f"No free local port found from {requested_port} to {requested_port + 49}.")


def open_browser_later(url: str) -> None:
    time.sleep(0.8)
    webbrowser.open(url, new=2)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Start Focus Reading Launcher locally and open it in a browser.")
    parser.add_argument("--host", default=DEFAULT_HOST, help=f"Host to bind. Default: {DEFAULT_HOST}")
    parser.add_argument("--port", type=int, default=DEFAULT_PORT, help=f"Preferred port. Default: {DEFAULT_PORT}")
    parser.add_argument("--no-browser", action="store_true", help="Start the server without opening a browser.")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    repo_root = Path(__file__).resolve().parent
    app_file = repo_root / APP_PATH

    if not app_file.exists():
        print(f"Cannot find {APP_PATH}. Please run this script from the learning-launcher project.", file=sys.stderr)
        return 1

    port = choose_port(args.host, args.port)
    url = f"http://{args.host}:{port}/{APP_PATH}"
    handler = functools.partial(QuietStaticHandler, directory=str(repo_root))

    with socketserver.ThreadingTCPServer((args.host, port), handler) as httpd:
        httpd.daemon_threads = True
        print("\nFocus Reading Launcher is running locally.", flush=True)
        if port != args.port:
            print(f"Port {args.port} is busy, using {port} instead.", flush=True)
        print(f"Open this URL: {url}", flush=True)
        print("Press Ctrl+C in this terminal to stop.\n", flush=True)

        if not args.no_browser:
            threading.Thread(target=open_browser_later, args=(url,), daemon=True).start()

        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped. See you next reading session.", flush=True)
            return 0

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
