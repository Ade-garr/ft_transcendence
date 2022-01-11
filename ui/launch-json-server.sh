#!/bin/bash

json-server --watch --host 0.0.0.0 -p 80 src/data/messages.json &
json-server --watch --host 0.0.0.0 -p 10000 src/data/users.json &
json-server --watch --host 0.0.0.0 -p 10001 src/data/games.json &
json-server --watch --host 0.0.0.0 -p 10002 src/data/chats.json &
json-server --watch --host 0.0.0.0 -p 10003 src/data/user.json &
json-server --watch --host 0.0.0.0 -p 10004 src/data/friends.json &
json-server --watch --host 0.0.0.0 -p 10005 src/data/blocked.json &



