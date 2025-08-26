class Ghost {
    constructor(
        x,
        y,
        width,
        height,
        speed,
        imageX,
        imageY,
        imageWidth,
        imageHeight,
        range
    ) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = speed;
        this.direction = DIRECTION_RIGHT;
        this.imageX = imageX;
        this.imageY = imageY;
        this.imageHeight = imageHeight;
        this.imageWidth = imageWidth;
        this.range = range;
        this.randomTargetIndex = parseInt(Math.random() * 4);
        this.target = randomTargetsForGhosts[this.randomTargetIndex];
        this.stuckCounter = 0; // Track if ghost is stuck
        setInterval(() => {
            this.changeRandomDirection();
        }, 10000);
    }

    isInRange() {
        let xDistance = Math.abs(pacman.getMapX() - this.getMapX());
        let yDistance = Math.abs(pacman.getMapY() - this.getMapY());
        if (
            Math.sqrt(xDistance * xDistance + yDistance * yDistance) <=
            this.range
        ) {
            return true;
        }
        return false;
    }

    changeRandomDirection() {
        let addition = 1;
        this.randomTargetIndex += addition;
        this.randomTargetIndex = this.randomTargetIndex % 4;
    }

    moveProcess(checkGhostOverlap = true) {
        if (this.isInRange()) {
            this.target = pacman;
        } else {
            this.target = randomTargetsForGhosts[this.randomTargetIndex];
        }
        let prevDirection = this.direction;
        this.changeDirectionIfPossible();

        // Only check for ghost overlap if requested (default true)
        const isTileOccupiedByOtherGhost = (x, y) => {
            if (!checkGhostOverlap) return false;
            for (let g of ghosts) {
                if (g !== this && g.getMapX() === x && g.getMapY() === y) {
                    return true;
                }
            }
            return false;
        };

        // Try to move in the current direction
        this.moveForwards();
        let tileX = this.getMapX(), tileY = this.getMapY();
        if (this.checkCollisions() || isTileOccupiedByOtherGhost(tileX, tileY)) {
            this.moveBackwards();
            // Try all other directions except reverse
            const directions = [DIRECTION_RIGHT, DIRECTION_UP, DIRECTION_LEFT, DIRECTION_BOTTOM];
            const reverseDir = (d) => {
                switch (d) {
                    case DIRECTION_RIGHT: return DIRECTION_LEFT;
                    case DIRECTION_LEFT: return DIRECTION_RIGHT;
                    case DIRECTION_UP: return DIRECTION_BOTTOM;
                    case DIRECTION_BOTTOM: return DIRECTION_UP;
                }
            };
            let moved = false;
            for (let d of directions) {
                if (d === prevDirection || d === reverseDir(prevDirection)) continue;
                this.direction = d;
                this.moveForwards();
                let altX = this.getMapX(), altY = this.getMapY();
                if (!this.checkCollisions() && !isTileOccupiedByOtherGhost(altX, altY)) {
                    moved = true;
                    break;
                }
                this.moveBackwards();
            }
            if (!moved) {
                // If all directions blocked or occupied, increment stuck counter
                this.stuckCounter = (this.stuckCounter || 0) + 1;
                // If stuck more than 1 frame, ignore other ghosts and just avoid walls
                if (this.stuckCounter > 1) {
                    for (let d of directions) {
                        if (d === prevDirection || d === reverseDir(prevDirection)) continue;
                        this.direction = d;
                        this.moveForwards();
                        if (!this.checkCollisions()) {
                            this.stuckCounter = 0;
                            return;
                        }
                        this.moveBackwards();
                    }
                    // Still stuck, stay in place
                    this.direction = prevDirection;
                }
            } else {
                this.stuckCounter = 0;
            }
        } else {
            this.stuckCounter = 0;
        }
    }

    moveBackwards() {
        switch (this.direction) {
            case 4: // Right
                this.x -= this.speed;
                break;
            case 3: // Up
                this.y += this.speed;
                break;
            case 2: // Left
                this.x += this.speed;
                break;
            case 1: // Bottom
                this.y -= this.speed;
                break;
        }
    }

    moveForwards() {
        switch (this.direction) {
            case 4: // Right
                this.x += this.speed;
                break;
            case 3: // Up
                this.y -= this.speed;
                break;
            case 2: // Left
                this.x -= this.speed;
                break;
            case 1: // Bottom
                this.y += this.speed;
                break;
        }
    }

    checkCollisions() {
        let isCollided = false;
        if (
            map[parseInt(this.y / oneBlockSize)][
                parseInt(this.x / oneBlockSize)
            ] == 1 ||
            map[parseInt(this.y / oneBlockSize + 0.9999)][
                parseInt(this.x / oneBlockSize)
            ] == 1 ||
            map[parseInt(this.y / oneBlockSize)][
                parseInt(this.x / oneBlockSize + 0.9999)
            ] == 1 ||
            map[parseInt(this.y / oneBlockSize + 0.9999)][
                parseInt(this.x / oneBlockSize + 0.9999)
            ] == 1
        ) {
            isCollided = true;
        }
        return isCollided;
    }

    changeDirectionIfPossible() {
        let tempDirection = this.direction;
        this.direction = this.calculateNewDirection(
            map,
            parseInt(this.target.x / oneBlockSize),
            parseInt(this.target.y / oneBlockSize)
        );
        if (typeof this.direction == "undefined") {
            this.direction = tempDirection;
            return;
        }
        if (
            this.getMapY() != this.getMapYRightSide() &&
            (this.direction == DIRECTION_LEFT ||
                this.direction == DIRECTION_RIGHT)
        ) {
            this.direction = DIRECTION_UP;
        }
        if (
            this.getMapX() != this.getMapXRightSide() &&
            this.direction == DIRECTION_UP
        ) {
            this.direction = DIRECTION_LEFT;
        }
        this.moveForwards();
        if (this.checkCollisions()) {
            this.moveBackwards();
            this.direction = tempDirection;
        } else {
            this.moveBackwards();
        }
        console.log(this.direction);
    }

    calculateNewDirection(map, destX, destY) {
        let mp = [];
        for (let i = 0; i < map.length; i++) {
            mp[i] = map[i].slice();
        }

        let queue = [
            {
                x: this.getMapX(),
                y: this.getMapY(),
                rightX: this.getMapXRightSide(),
                rightY: this.getMapYRightSide(),
                moves: [],
            },
        ];
        while (queue.length > 0) {
            let poped = queue.shift();
            if (poped.x == destX && poped.y == destY) {
                return poped.moves[0];
            } else {
                mp[poped.y][poped.x] = 1;
                let neighborList = this.addNeighbors(poped, mp);
                for (let i = 0; i < neighborList.length; i++) {
                    queue.push(neighborList[i]);
                }
            }
        }

        return 1; // direction
    }

    addNeighbors(poped, mp) {
        let queue = [];
        let numOfRows = mp.length;
        let numOfColumns = mp[0].length;

        if (
            poped.x - 1 >= 0 &&
            poped.x - 1 < numOfColumns &&
            mp[poped.y][poped.x - 1] != 1
        ) {
            let tempMoves = poped.moves.slice();
            tempMoves.push(DIRECTION_LEFT);
            queue.push({ x: poped.x - 1, y: poped.y, moves: tempMoves });
        }
        if (
            poped.x + 1 >= 0 &&
            poped.x + 1 < numOfColumns &&
            mp[poped.y][poped.x + 1] != 1
        ) {
            let tempMoves = poped.moves.slice();
            tempMoves.push(DIRECTION_RIGHT);
            queue.push({ x: poped.x + 1, y: poped.y, moves: tempMoves });
        }
        if (
            poped.y - 1 >= 0 &&
            poped.y - 1 < numOfRows &&
            mp[poped.y - 1][poped.x] != 1
        ) {
            let tempMoves = poped.moves.slice();
            tempMoves.push(DIRECTION_UP);
            queue.push({ x: poped.x, y: poped.y - 1, moves: tempMoves });
        }
        if (
            poped.y + 1 >= 0 &&
            poped.y + 1 < numOfRows &&
            mp[poped.y + 1][poped.x] != 1
        ) {
            let tempMoves = poped.moves.slice();
            tempMoves.push(DIRECTION_BOTTOM);
            queue.push({ x: poped.x, y: poped.y + 1, moves: tempMoves });
        }
        return queue;
    }

    getMapX() {
        let mapX = parseInt(this.x / oneBlockSize);
        return mapX;
    }

    getMapY() {
        let mapY = parseInt(this.y / oneBlockSize);
        return mapY;
    }

    getMapXRightSide() {
        let mapX = parseInt((this.x * 0.99 + oneBlockSize) / oneBlockSize);
        return mapX;
    }

    getMapYRightSide() {
        let mapY = parseInt((this.y * 0.99 + oneBlockSize) / oneBlockSize);
        return mapY;
    }

    changeAnimation() {
        this.currentFrame =
            this.currentFrame == this.frameCount ? 1 : this.currentFrame + 1;
    }

    draw() {
        canvasContext.save();
        canvasContext.drawImage(
            ghostFrames,
            this.imageX,
            this.imageY,
            this.imageWidth,
            this.imageHeight,
            this.x,
            this.y,
            this.width,
            this.height
        );
        canvasContext.restore();
    }
}

let updateGhosts = () => {
    // Track intended next positions for this frame
    let intendedPositions = new Set();
    for (let i = 0; i < ghosts.length; i++) {
        let ghost = ghosts[i];
        let origDirection = ghost.direction;
        let origX = ghost.x;
        let origY = ghost.y;
        let moved = false;
        // Try current direction first
        ghost.moveProcess(false); // false = don't check for ghost overlap inside moveProcess
        let nextTile = ghost.getMapX() + ',' + ghost.getMapY();
        if (ghost.getMapY() > 11 && intendedPositions.has(nextTile)) {
            ghost.x = origX;
            ghost.y = origY;
            ghost.direction = origDirection;
            // Try all other directions except reverse
            const directions = [DIRECTION_RIGHT, DIRECTION_UP, DIRECTION_LEFT, DIRECTION_BOTTOM];
            const reverseDir = (d) => {
                switch (d) {
                    case DIRECTION_RIGHT: return DIRECTION_LEFT;
                    case DIRECTION_LEFT: return DIRECTION_RIGHT;
                    case DIRECTION_UP: return DIRECTION_BOTTOM;
                    case DIRECTION_BOTTOM: return DIRECTION_UP;
                }
            };
            for (let d of directions) {
                if (d === origDirection || d === reverseDir(origDirection)) continue;
                ghost.direction = d;
                ghost.moveForwards();
                let altTile = ghost.getMapX() + ',' + ghost.getMapY();
                if (!ghost.checkCollisions() && !intendedPositions.has(altTile)) {
                    intendedPositions.add(altTile);
                    moved = true;
                    break;
                }
                ghost.x = origX;
                ghost.y = origY;
            }
            if (!moved) {
                ghost.direction = origDirection;
                intendedPositions.add(origX + ',' + origY); // Stay in place
            }
        } else {
            intendedPositions.add(nextTile);
        }
    }
};

let drawGhosts = () => {
    for (let i = 0; i < ghosts.length; i++) {
        ghosts[i].draw();
    }
};
