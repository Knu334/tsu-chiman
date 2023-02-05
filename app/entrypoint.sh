#!/bin/bash

if [ ! -d ./prisma/migrate ]; then
    npx prisma migrate dev --name init
fi
npx ts-node -r tsconfig-paths/register server.ts