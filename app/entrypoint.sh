#!/bin/bash

npx prisma migrate dev --name subscription
npx ts-node -r tsconfig-paths/register src/server.ts