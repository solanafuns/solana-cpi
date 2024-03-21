#!/bin/bash

set -x 

solana-test-validator -r > v.log 2>&1 &

last_pid=$!
sleep 2

(
    cd module
    cargo build-bpf
    solana program deploy target/deploy/module.so
)

sleep 1

(
    cd main
    cargo build-bpf
    solana program deploy target/deploy/main.so
)

(
    cd client
    yarn start 
)

echo "kill -9 $last_pid"
