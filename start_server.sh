#!/bin/bash
echo "🚀 Starting TONI 2.0 Local Server..."
echo "This avoids 'file://' security restrictions for VR textures."
node proxy/server.js &
npx serve .
