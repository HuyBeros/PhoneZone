#!/bin/sh
set -eu

fail() {
    printf '[PhoneZone] Startup configuration error: %s\n' "$1" >&2
    exit 1
}

require_value() {
    [ -n "$2" ] || fail "$1 is missing or empty in the service environment."
}

require_key() {
    case "$2" in
        http://*|https://*|classpath:*)
            # Non-filesystem providers are validated by SmallRye JWT itself.
            return
            ;;
        file:*) key_path=${2#file:} ;;
        *) key_path=$2 ;;
    esac
    [ -f "$key_path" ] || fail "$1 does not resolve to a file. Check the Secret File name and location."
    [ -r "$key_path" ] || fail "$1 is not readable by the application user. Check the Secret File permissions and group 1000."
}

# Report variable names only. Never log passwords, connection URLs or key contents.
require_value DB_JDBC_URL "${DB_JDBC_URL:-}"
require_value DB_USERNAME "${DB_USERNAME:-}"
require_value DB_PASSWORD "${DB_PASSWORD:-}"
require_value JWT_PUBLIC_KEY_LOCATION "${JWT_PUBLIC_KEY_LOCATION:-}"
require_value JWT_PRIVATE_KEY_LOCATION "${JWT_PRIVATE_KEY_LOCATION:-}"
require_key JWT_PUBLIC_KEY_LOCATION "$JWT_PUBLIC_KEY_LOCATION"
require_key JWT_PRIVATE_KEY_LOCATION "$JWT_PRIVATE_KEY_LOCATION"

printf '[PhoneZone] Configuration preflight passed; starting Quarkus.\n'
exec "$@"
