#!/bin/sh
# Environment Variable Injector
# This script is used as an entrypoint for the container
# to inject environment variables at startup

# Generate runtime environment variables
/docker/generate-runtime-env.sh

# Execute the passed command (typically nginx -g 'daemon off;')
exec "$@"
